import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Exercise } from "@/lib/workout.functions";
import { activeSessionQO, exercisesQO } from "@/lib/workout.queries";
import { areaName } from "@/lib/workout.constants";
import { getMachine } from "@/lib/machines";
import { Button } from "@/components/ui/button";
import { Check, Pencil, Plus, Play, Dumbbell } from "lucide-react";
import { UserActions } from "@/components/user-actions";
import { AppHeader } from "@/components/app-header";
import { MachineImage } from "@/components/machine-image";
import { ExerciseFormDialog } from "@/components/exercise-form-dialog";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/areas/$areaId/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(exercisesQO),
      context.queryClient.ensureQueryData(activeSessionQO),
    ]),
  head: ({ params }) => {
    const area = areaName(params.areaId);
    const desc = `מכשירי האימון באזור ${area} — נהל משקל, חזרות וסטים והתחל אימון עם טיימר מנוחה אוטומטי.`;
    const url = `https://mygym-sparta.lovable.app/areas/${params.areaId}`;
    return {
      meta: [
        { title: `${area} — מכשירי אימון` },
        { name: "description", content: desc },
        { property: "og:title", content: `${area} — מכשירי אימון` },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { name: "twitter:title", content: `${area} — מכשירי אימון` },
        { name: "twitter:description", content: desc },
        { name: "robots", content: "noindex" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: AreaPage,
});

function AreaPage() {
  const { areaId } = Route.useParams();
  const { data: all } = useSuspenseQuery(exercisesQO);
  const { data: session } = useSuspenseQuery(activeSessionQO);
  const list = all.filter((e) => e.area === areaId);

  const [editing, setEditing] = useState<Exercise | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AppHeader
        back={{ to: "/areas", label: "חזרה לאזורי האימון" }}
        eyebrow="אזור אימון"
        title={areaName(areaId)}
        actions={<UserActions />}
      />

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Dumbbell className="size-8" aria-hidden />
            </div>
            <p className="mt-4 text-lg font-bold">עוד אין מכשירים באזור הזה</p>
            <p className="mt-1 text-muted-foreground">הוסיפו את המכשיר הראשון כדי להתחיל להתאמן</p>
            <Button onClick={() => setAdding(true)} size="touch" className="mt-6 font-bold">
              <Plus aria-hidden />
              הוספת מכשיר
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground tabular-nums">
                {list.length === 1 ? "מכשיר אחד" : `${list.length} מכשירים`}
              </span>
              <Button onClick={() => setAdding(true)} size="touch" className="font-bold">
                <Plus aria-hidden />
                מכשיר חדש
              </Button>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((ex, i) => (
                <li
                  key={ex.id}
                  className="animate-in fade-in slide-in-from-bottom-2 [animation-duration:300ms] [animation-fill-mode:both]"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <ExerciseCard
                    ex={ex}
                    areaId={areaId}
                    done={session?.counts[ex.id] ?? 0}
                    onEdit={() => setEditing(ex)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      {editing && (
        <ExerciseFormDialog area={areaId} exercise={editing} onClose={() => setEditing(null)} />
      )}
      {adding && <ExerciseFormDialog area={areaId} onClose={() => setAdding(false)} />}
    </div>
  );
}

function ExerciseCard({
  ex,
  areaId,
  done,
  onEdit,
}: {
  ex: Exercise;
  areaId: string;
  /** Sets of this exercise in the active workout. */
  done: number;
  onEdit: () => void;
}) {
  const machine = getMachine(ex.name);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative">
        <MachineImage machine={machine} label={ex.name} className="aspect-[4/3]" />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/30"
        />
        {machine && (
          <span className="absolute start-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur tabular-nums">
            מכשיר {machine.number}
          </span>
        )}
        <Button
          size="icon-touch"
          variant="ghost"
          onClick={onEdit}
          aria-label={`עריכת ${ex.name}`}
          className="absolute end-2 top-2 bg-black/45 text-white backdrop-blur hover:bg-black/65 hover:text-white"
        >
          <Pencil aria-hidden />
        </Button>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black">{machine?.nameHe ?? ex.name}</h2>
            {machine && machine.nameHe !== ex.name && (
              <p className="truncate text-xs text-white/75">{ex.name}</p>
            )}
          </div>
          <div className="shrink-0 text-end leading-none">
            <span className="text-3xl font-black tabular-nums">{ex.weight}</span>
            <span className="ms-1 text-xs font-semibold text-white/80">ק"ג</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground tabular-nums">
            {ex.sets} סטים × {ex.reps} חזרות
          </span>
          {done > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary tabular-nums">
              <Check className="size-3.5" aria-hidden />
              {done}/{ex.sets} באימון
            </span>
          )}
        </div>
        <Link
          to="/areas/$areaId/exercise/$exerciseId"
          params={{ areaId, exerciseId: ex.id }}
          className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20 transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Play className="size-4 fill-current" aria-hidden />
          {done > 0 && done < ex.sets ? "המשך אימון" : "התחל אימון"}
        </Link>
      </div>
    </article>
  );
}
