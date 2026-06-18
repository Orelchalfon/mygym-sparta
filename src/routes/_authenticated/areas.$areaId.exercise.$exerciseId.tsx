import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listExercises, completeSet } from "@/lib/workout.functions";
import { REST_SECONDS } from "@/lib/workout.constants";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, SkipForward, Dumbbell, Repeat } from "lucide-react";
import { toast } from "sonner";

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

type Phase = "active" | "resting";

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
  const [phase, setPhase] = useState<Phase>("active");
  const [seconds, setSeconds] = useState(REST_SECONDS);
  const [busy, setBusy] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // rest timer
  useEffect(() => {
    if (phase !== "resting") return;
    tickRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          setPhase("active");
          setSeconds(REST_SECONDS);
          return REST_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase]);

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">מכשיר לא נמצא</div>
      </div>
    );
  }

  const totalSets = exercise.sets;
  const remaining = totalSets - completedNow;
  const currentSet = completedNow + 1;

  function exit() {
    navigate({ to: "/areas/$areaId", params: { areaId } });
  }

  async function finishSet() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await completeFn({ data: { id: exerciseId } });
      qc.invalidateQueries({ queryKey: ["exercises"] });
      if (res.finished) {
        toast.success(`כל הכבוד! סיימת ${totalSets} סטים 💪`);
        // auto-exit back to area
        setTimeout(() => exit(), 400);
      } else {
        setCompletedNow(res.completed_sets);
        setSeconds(REST_SECONDS);
        setPhase("resting");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setBusy(false);
    }
  }

  function skipRest() {
    if (tickRef.current) clearInterval(tickRef.current);
    setPhase("active");
    setSeconds(REST_SECONDS);
  }

  if (phase === "resting") {
    const pct = ((REST_SECONDS - seconds) / REST_SECONDS) * 100;
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center bg-background gap-8 px-6">
        <button
          onClick={exit}
          className="absolute top-5 left-5 grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          title="צא"
          aria-label="סגור והחזור לאזור האימון"
        >
          <X className="size-5" />
        </button>

        <div className="text-xs font-semibold uppercase tracking-widest text-primary">
          מנוחה
        </div>

        <div className="relative size-72 sm:size-80">
          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-muted/40"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="text-primary transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-7xl font-black tabular-nums sm:text-8xl">{seconds}</div>
            <div className="mt-1 text-xs text-muted-foreground">שניות</div>
          </div>
        </div>

        <div className="rounded-full border border-border bg-card px-4 py-2 text-sm">
          הסט הבא:{" "}
          <span className="font-bold text-foreground">
            {completedNow + 1} / {totalSets}
          </span>
        </div>

        <Button onClick={skipRest} variant="outline" size="lg" className="gap-2">
          <SkipForward className="size-4" />
          דלג למנוחה
        </Button>
      </div>
    );
  }

  // active
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={exit}
            className="grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            title="צא"
            aria-label="סגור והחזור לאזור האימון"
          >
            <X className="size-5" />
          </button>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            באימון
          </div>
          <div className="size-10" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-6 py-8">
        {/* Title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Dumbbell className="size-7" />
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">{exercise.name}</h1>
        </div>

        {/* Sets progress dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSets }).map((_, i) => {
            const done = i < completedNow;
            const current = i === completedNow;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  done
                    ? "bg-primary/20 text-primary"
                    : current
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-3" /> : <span>{i + 1}</span>}
              </div>
            );
          })}
        </div>

        {/* Stats card */}
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl">
          <div className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            סט {currentSet} מתוך {totalSets}
          </div>
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border">
            <Stat label="משקל" value={exercise.weight} unit='ק"ג' accent />
            <Stat label="חזרות" value={exercise.reps} />
            <Stat label="נותרו" value={remaining} unit={`/${totalSets}`} />
          </div>
        </div>

        {/* Action button */}
        <Button
          onClick={finishSet}
          disabled={busy}
          className="h-16 w-full max-w-md rounded-2xl text-lg font-black shadow-xl shadow-primary/30"
        >
          <Check className="size-5" />
          סיימתי סט
        </Button>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Repeat className="size-3.5" />
          מנוחה אוטומטית של {REST_SECONDS} שניות אחרי כל סט
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
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-4xl font-black tabular-nums sm:text-5xl ${
          accent ? "text-primary" : ""
        }`}
      >
        {value}
      </div>
      {unit && (
        <div className="mt-0.5 text-xs text-muted-foreground">{unit}</div>
      )}
    </div>
  );
}
