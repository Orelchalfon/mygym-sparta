import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listExercises, completeSet } from "@/lib/workout.functions";
import { REST_SECONDS } from "@/lib/workout.constants";
import { getMachine } from "@/lib/machines";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MachineImage } from "@/components/machine-image";
import { X, Check, SkipForward, Repeat, Plus, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const exercisesQO = queryOptions({
  queryKey: ["exercises"],
  queryFn: () => listExercises(),
});

export const Route = createFileRoute("/_authenticated/areas/$areaId/exercise/$exerciseId")({
  loader: ({ context }) => context.queryClient.ensureQueryData(exercisesQO),
  head: ({ params }) => {
    const url = `https://mygym-sparta.lovable.app/areas/${params.areaId}/exercise/${params.exerciseId}`;
    const title = "אימון פעיל — אימון אישי";
    const desc = "בצע סטים, עקוב אחר התקדמות והפעל טיימר מנוחה אוטומטי בין סטים.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "robots", content: "noindex" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ExercisePage,
});

/** Rest state survives refresh/lock: we store when it ends, not a countdown. */
type Rest = { endsAt: number; total: number };
const restKey = (id: string) => `sparta:rest:${id}`;

function readRest(id: string): Rest | null {
  try {
    const raw = sessionStorage.getItem(restKey(id));
    if (!raw) return null;
    const r = JSON.parse(raw) as Rest;
    return r.endsAt > Date.now() ? r : null;
  } catch {
    return null;
  }
}

function writeRest(id: string, r: Rest | null) {
  try {
    if (r) sessionStorage.setItem(restKey(id), JSON.stringify(r));
    else sessionStorage.removeItem(restKey(id));
  } catch {
    /* private mode — the timer still works in memory */
  }
}

type WakeLockSentinel = { release: () => Promise<void> };

/** Keeps the screen awake during a workout where supported. */
function useWakeLock() {
  useEffect(() => {
    const wakeLock = (
      navigator as Navigator & {
        wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinel> };
      }
    ).wakeLock;
    if (!wakeLock) return;
    let lock: WakeLockSentinel | null = null;
    let disposed = false;
    const acquire = () => {
      if (document.visibilityState !== "visible") return;
      wakeLock
        .request("screen")
        .then((l) => {
          if (disposed) l.release().catch(() => {});
          else lock = l;
        })
        .catch(() => {});
    };
    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", acquire);
      lock?.release().catch(() => {});
    };
  }, []);
}

function ExercisePage() {
  const { areaId, exerciseId } = Route.useParams();
  const { data: all } = useSuspenseQuery(exercisesQO);
  const exercise = all.find((e) => e.id === exerciseId);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const completeFn = useServerFn(completeSet);

  const today = new Date().toISOString().slice(0, 10);
  const initialDone =
    exercise && exercise.last_completed_date === today ? exercise.completed_sets : 0;

  const [completedNow, setCompletedNow] = useState(initialDone);
  const [rest, setRest] = useState<Rest | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [announce, setAnnounce] = useState("");
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useWakeLock();

  // Resume a rest that was running before a refresh / app switch.
  useEffect(() => {
    const r = readRest(exerciseId);
    if (r) setRest(r);
  }, [exerciseId]);

  const endRest = useCallback(
    (natural: boolean) => {
      writeRest(exerciseId, null);
      setRest(null);
      if (natural) {
        navigator.vibrate?.([200, 100, 200]);
        setAnnounce("המנוחה הסתיימה — זמן לסט הבא");
      }
    },
    [exerciseId],
  );

  // Tick from the wall clock; recompute right away when the tab becomes visible again.
  useEffect(() => {
    if (!rest) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= rest.endsAt) endRest(true);
    };
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [rest, endRest]);

  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    [],
  );

  if (!exercise) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-lg font-bold">המכשיר לא נמצא</p>
        <Button size="touch" onClick={() => navigate({ to: "/areas/$areaId", params: { areaId } })}>
          חזרה לאזור
        </Button>
      </div>
    );
  }

  const machine = getMachine(exercise.name);
  const title = machine?.nameHe ?? exercise.name;
  const totalSets = exercise.sets;
  const currentSet = Math.min(completedNow + 1, totalSets);

  function exit() {
    writeRest(exerciseId, null);
    navigate({ to: "/areas/$areaId", params: { areaId } });
  }

  async function finishSet() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await completeFn({ data: { id: exerciseId } });
      qc.invalidateQueries({ queryKey: ["exercises"] });
      if (res.finished) {
        setCompletedNow(totalSets);
        setFinished(true);
        navigator.vibrate?.(80);
        exitTimer.current = setTimeout(exit, 1600);
      } else {
        setCompletedNow(res.completed_sets);
        const r = { endsAt: Date.now() + REST_SECONDS * 1000, total: REST_SECONDS };
        writeRest(exerciseId, r);
        setNow(Date.now());
        setRest(r);
        setAnnounce("");
      }
    } catch {
      toast.error("לא הצלחנו לשמור את הסט. בדקו את החיבור ונסו שוב.");
    } finally {
      setBusy(false);
    }
  }

  function addTime() {
    if (!rest) return;
    const r = { endsAt: rest.endsAt + 15_000, total: rest.total + 15 };
    writeRest(exerciseId, r);
    setRest(r);
  }

  const shell =
    "relative flex min-h-[calc(100dvh-72px-env(safe-area-inset-bottom))] flex-col bg-background";
  const topBar = (label: string) => (
    <header className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <Button
        variant="ghost"
        size="icon-touch"
        onClick={exit}
        aria-label="יציאה מהאימון וחזרה לאזור"
        className="text-muted-foreground"
      >
        <X className="size-5" />
      </Button>
      <span className="text-sm font-bold tracking-wide text-primary">{label}</span>
      <span className="size-11" aria-hidden />
    </header>
  );
  const live = (
    <p aria-live="polite" className="sr-only">
      {announce}
    </p>
  );

  if (finished) {
    return (
      <div className={cn(shell, "items-center justify-center gap-6 px-6 text-center")}>
        {live}
        <div className="grid size-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 animate-in zoom-in-50 [animation-duration:300ms]">
          <Trophy className="size-11" aria-hidden />
        </div>
        <div role="status">
          <h1 className="text-3xl font-black">כל הכבוד!</h1>
          <p className="mt-2 text-muted-foreground">
            סיימת {totalSets} סטים ב{title}
          </p>
        </div>
        <Button size="touch" variant="outline" onClick={exit}>
          חזרה לאזור
        </Button>
      </div>
    );
  }

  if (rest) {
    const remainingMs = Math.max(0, rest.endsAt - now);
    const seconds = Math.ceil(remainingMs / 1000);
    const frac = 1 - remainingMs / (rest.total * 1000);
    const C = 2 * Math.PI * 45;
    return (
      <div className={shell}>
        {live}
        {topBar("מנוחה")}

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-6 py-6">
          <div
            className="relative size-64 sm:size-72"
            role="timer"
            aria-label={`נותרו ${seconds} שניות מנוחה`}
          >
            <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
              <circle cx="50" cy="50" r="45" fill="none" strokeWidth="5" className="stroke-muted" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * frac}
                className="stroke-primary transition-[stroke-dashoffset] duration-300 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-7xl font-black tabular-nums sm:text-8xl">{seconds}</div>
              <div className="mt-1 text-sm text-muted-foreground">שניות</div>
            </div>
          </div>

          <div className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <MachineImage machine={machine} className="size-14 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground">הסט הבא</div>
              <div className="truncate font-bold tabular-nums">
                סט {currentSet} מתוך {totalSets}
              </div>
            </div>
            <div className="shrink-0 text-end text-sm font-bold tabular-nums">
              {exercise.weight} ק"ג × {exercise.reps}
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            <Button variant="outline" size="touch" onClick={addTime}>
              <Plus aria-hidden />
              15 שניות
            </Button>
            <Button size="touch" onClick={() => endRest(false)} className="font-bold">
              <SkipForward aria-hidden className="rtl:-scale-x-100" />
              דלג על המנוחה
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // active set
  return (
    <div className={shell}>
      {live}
      {topBar("באימון")}

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-2 pb-6">
        <div className="relative overflow-hidden rounded-3xl shadow-xl">
          <MachineImage machine={machine} label={exercise.name} className="aspect-[4/3]" eager />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            {machine && (
              <div className="text-xs font-bold text-white/80 tabular-nums">
                מכשיר {machine.number}
              </div>
            )}
            <h1 className="text-2xl font-black leading-tight sm:text-3xl">{title}</h1>
          </div>
        </div>

        <ol
          className="flex items-center justify-center gap-2"
          aria-label={`סט ${currentSet} מתוך ${totalSets}`}
        >
          {Array.from({ length: totalSets }).map((_, i) => {
            const done = i < completedNow;
            const current = i === completedNow;
            return (
              <li
                key={i}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "grid h-8 min-w-8 place-items-center rounded-full px-2 text-sm font-bold tabular-nums transition-colors duration-200",
                  done && "bg-primary/15 text-primary",
                  current && "bg-primary text-primary-foreground shadow-md shadow-primary/30",
                  !done && !current && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" aria-label="הושלם" /> : i + 1}
              </li>
            );
          })}
        </ol>

        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border rounded-3xl border border-border bg-card py-5 shadow-sm">
          <Stat label="משקל" value={exercise.weight} unit='ק"ג' accent />
          <Stat label="חזרות" value={exercise.reps} />
          <Stat label="סט" value={currentSet} unit={`מתוך ${totalSets}`} />
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button
            onClick={finishSet}
            disabled={busy}
            className="h-16 w-full rounded-2xl text-lg font-black shadow-xl shadow-primary/30 active:scale-[0.98] [&_svg]:size-5"
          >
            {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
            {busy ? "שומר..." : "סיימתי סט"}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Repeat className="size-4" aria-hidden />
            מנוחה של {REST_SECONDS} שניות אחרי כל סט
          </p>
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: number | string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className="px-2 text-center">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-4xl font-black tabular-nums", accent && "text-primary")}>
        {value}
      </div>
      {unit && <div className="mt-0.5 text-xs text-muted-foreground">{unit}</div>}
    </div>
  );
}
