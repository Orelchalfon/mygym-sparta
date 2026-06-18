import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listExercises, resetDay } from "@/lib/workout.functions";
import { AREAS } from "@/lib/workout.constants";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const exercisesQO = queryOptions({
  queryKey: ["exercises"],
  queryFn: () => listExercises(),
});

export const Route = createFileRoute("/_authenticated/areas")({
  loader: ({ context }) => context.queryClient.ensureQueryData(exercisesQO),
  component: AreasPage,
});

function isDoneToday(ex: { completed_sets: number; sets: number; last_completed_date: string | null }) {
  const today = new Date().toISOString().slice(0, 10);
  return ex.last_completed_date === today && ex.completed_sets >= ex.sets;
}

function AreasPage() {
  const { data: exercises } = useSuspenseQuery(exercisesQO);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const resetFn = useServerFn(resetDay);
  const reset = useMutation({
    mutationFn: () => resetFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("היום אופס");
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">האימון שלי</h1>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => reset.mutate()}
            disabled={reset.isPending}
            title="אפס יום"
          >
            <RotateCcw className="size-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={signOut} title="התנתק">
            <LogOut className="size-5" />
          </Button>
        </div>
      </header>

      <div className="p-5 grid grid-cols-2 gap-4">
        {AREAS.map((area) => {
          const list = exercises.filter((e) => e.area === area.id);
          const done = list.filter(isDoneToday).length;
          const total = list.length;
          const allDone = total > 0 && done === total;
          return (
            <Link
              key={area.id}
              to="/areas/$areaId"
              params={{ areaId: area.id }}
              className={`relative rounded-2xl p-5 border transition-all active:scale-95 ${
                allDone
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <div className="text-3xl mb-2">{area.emoji}</div>
              <div className="text-lg font-bold">{area.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {total === 0 ? "אין מכשירים" : `${done}/${total} הושלמו`}
              </div>
              {allDone && (
                <div className="absolute top-3 left-3 text-emerald-400 text-xl">✓</div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
