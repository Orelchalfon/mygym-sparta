import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listExercises, completeSet } from "@/lib/workout.functions";
import { REST_SECONDS } from "@/lib/workout.constants";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

const exercisesQO = queryOptions({
  queryKey: ["exercises"],
  queryFn: () => listExercises(),
});

export const Route = createFileRoute("/_authenticated/areas/$areaId/exercise/$exerciseId")({
  loader: ({ context }) => context.queryClient.ensureQueryData(exercisesQO),
  component: ExercisePage,
});

type Phase = "active" | "resting" | "done";

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

  const [completedToday, setCompletedToday] = useState(initialDone);
  const [phase, setPhase] = useState<Phase>("active");
  const [seconds, setSeconds] = useState(REST_SECONDS);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!exercise) return;
    if (completedToday >= exercise.sets) setPhase("done");
  }, [completedToday, exercise]);

  // timer
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

  const remaining = exercise.sets - completedToday;

  async function finishSet() {
    try {
      const res = await completeFn({ data: { id: exerciseId } });
      setCompletedToday(res.completed_sets);
      qc.invalidateQueries({ queryKey: ["exercises"] });
      if (res.completed_sets >= res.sets) {
        setPhase("done");
        toast.success("המכשיר הושלם! 💪");
      } else {
        setSeconds(REST_SECONDS);
        setPhase("resting");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    }
  }

  function exit() {
    navigate({ to: "/areas/$areaId", params: { areaId } });
  }

  if (phase === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 px-6 text-center">
        <div className="text-8xl">🎉</div>
        <h1 className="text-3xl font-bold">מעולה!</h1>
        <p className="text-muted-foreground">סיימת את {exercise.name}</p>
        <Button size="lg" onClick={exit} className="bg-orange-500 hover:bg-orange-600">
          חזרה לרשימה
        </Button>
      </div>
    );
  }

  if (phase === "resting") {
    const pct = ((REST_SECONDS - seconds) / REST_SECONDS) * 100;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-8 px-6">
        <button
          onClick={exit}
          className="absolute top-5 left-5 p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-6" />
        </button>
        <div className="text-muted-foreground text-lg">מנוחה</div>
        <div className="relative size-72">
          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="text-orange-500 transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-7xl font-bold tabular-nums">{seconds}</div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          הסט הבא: {exercise.sets - completedToday} מתוך {exercise.sets}
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (tickRef.current) clearInterval(tickRef.current);
            setPhase("active");
            setSeconds(REST_SECONDS);
          }}
        >
          דלג
        </Button>
      </div>
    );
  }

  // active
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-4">
        <button onClick={exit} className="p-2 text-muted-foreground hover:text-foreground">
          <X className="size-6" />
        </button>
        <div className="text-sm text-muted-foreground">
          סט {completedToday + 1} / {exercise.sets}
        </div>
        <div className="size-10" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-10">
        <h1 className="text-3xl font-bold text-center">{exercise.name}</h1>

        <div className="grid grid-cols-3 gap-6 w-full max-w-md text-center">
          <div>
            <div className="text-sm text-muted-foreground mb-1">משקל</div>
            <div className="text-5xl font-bold tabular-nums text-orange-400">
              {exercise.weight}
            </div>
            <div className="text-xs text-muted-foreground mt-1">ק"ג</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">חזרות</div>
            <div className="text-5xl font-bold tabular-nums">{exercise.reps}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">נותרו</div>
            <div className="text-5xl font-bold tabular-nums">{remaining}</div>
            <div className="text-xs text-muted-foreground mt-1">/ {exercise.sets}</div>
          </div>
        </div>

        <Button
          onClick={finishSet}
          className="w-full max-w-md h-20 text-2xl font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/30"
        >
          סיימתי סט ←
        </Button>
        <div className="text-xs text-muted-foreground">
          לחיצה תתחיל מנוחה של {REST_SECONDS} שניות
        </div>
      </div>
    </div>
  );
}
