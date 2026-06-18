import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listExercises,
  updateExercise,
  createExercise,
  deleteExercise,
  type Exercise,
} from "@/lib/workout.functions";
import { areaName } from "@/lib/workout.constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowRight, Pencil, Plus, Play, Trash2, Dumbbell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const exercisesQO = queryOptions({
  queryKey: ["exercises"],
  queryFn: () => listExercises(),
});


export const Route = createFileRoute("/_authenticated/areas/$areaId/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(exercisesQO),
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

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={type === "number" ? "decimal" : undefined}
      />
    </div>
  );
}


function AreaPage() {
  const { areaId } = Route.useParams();
  const { data: all } = useSuspenseQuery(exercisesQO);
  const list = all.filter((e) => e.area === areaId);

  const [editing, setEditing] = useState<Exercise | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/areas"
            className="grid size-10 shrink-0 place-items-center rounded-xl hover:bg-muted"
            title="חזרה"
            aria-label="חזרה לאזורי האימון"
          >
            <ArrowRight className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">אזור אימון</div>
            <h1 className="truncate text-lg font-bold leading-tight sm:text-xl">
              {areaName(areaId)}
            </h1>
          </div>
          <Button
            onClick={() => setAdding(true)}
            className="shrink-0 gap-1.5 rounded-xl"
            size="sm"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">מכשיר חדש</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-muted">
              <Dumbbell className="size-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-base font-semibold">אין מכשירים באזור זה</p>
            <p className="mt-1 text-sm text-muted-foreground">
              הוסף את המכשיר הראשון שלך כדי להתחיל
            </p>
            <Button onClick={() => setAdding(true)} className="mt-5 gap-1.5">
              <Plus className="size-4" />
              הוסף מכשיר
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {list.map((ex) => (
              <ExerciseCard
                key={ex.id}
                ex={ex}
                areaId={areaId}
                onEdit={() => setEditing(ex)}
              />
            ))}
          </div>
        )}
      </main>

      {editing && <EditDialog exercise={editing} onClose={() => setEditing(null)} />}
      {adding && <AddDialog area={areaId} onClose={() => setAdding(false)} />}
    </div>
  );
}

function ExerciseCard({
  ex,
  areaId,
  onEdit,
}: {
  ex: Exercise;
  areaId: string;
  onEdit: () => void;
}) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-lg font-bold">{ex.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {ex.sets} סטים × {ex.reps} חזרות
          </div>
        </div>
        <button
          onClick={onEdit}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          title="ערוך"
        >
          <Pencil className="size-4" />
        </button>
      </div>

      <div className="my-5 flex items-baseline justify-center gap-1">
        <span className="text-5xl font-black tabular-nums text-primary">
          {ex.weight}
        </span>
        <span className="text-sm font-semibold text-muted-foreground">ק"ג</span>
      </div>

      <Link
        to="/areas/$areaId/exercise/$exerciseId"
        params={{ areaId, exerciseId: ex.id }}
        className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <Play className="size-4 fill-current" />
        התחל אימון
      </Link>
    </div>
  );
}

function EditDialog({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const qc = useQueryClient();
  const updateFn = useServerFn(updateExercise);
  const deleteFn = useServerFn(deleteExercise);
  const [name, setName] = useState(exercise.name);
  const [weight, setWeight] = useState(String(exercise.weight));
  const [reps, setReps] = useState(String(exercise.reps));
  const [sets, setSets] = useState(String(exercise.sets));

  const update = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          id: exercise.id,
          name,
          weight: Number(weight),
          reps: Number(reps),
          sets: Number(sets),
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("נשמר");
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "שגיאה"),
  });

  const del = useMutation({
    mutationFn: () => deleteFn({ data: { id: exercise.id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("נמחק");
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת מכשיר</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="שם" value={name} onChange={setName} />
          <Field label='משקל (ק"ג)' value={weight} onChange={setWeight} type="number" />
          <Field label="חזרות" value={reps} onChange={setReps} type="number" />
          <Field label="סטים" value={sets} onChange={setSets} type="number" />
        </div>
        <DialogFooter className="flex !flex-row !justify-between gap-2">
          <Button
            variant="destructive"
            onClick={() => del.mutate()}
            disabled={del.isPending}
          >
            <Trash2 className="size-4 ml-1" />
            מחק
          </Button>
          <Button onClick={() => update.mutate()} disabled={update.isPending}>
            שמור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddDialog({ area, onClose }: { area: string; onClose: () => void }) {
  const qc = useQueryClient();
  const createFn = useServerFn(createExercise);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("25");
  const [reps, setReps] = useState("7");
  const [sets, setSets] = useState("3");

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          area,
          name,
          weight: Number(weight),
          reps: Number(reps),
          sets: Number(sets),
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("נוסף");
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "שגיאה"),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת מכשיר</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="שם" value={name} onChange={setName} />
          <Field label='משקל (ק"ג)' value={weight} onChange={setWeight} type="number" />
          <Field label="חזרות" value={reps} onChange={setReps} type="number" />
          <Field label="סטים" value={sets} onChange={setSets} type="number" />
        </div>
        <DialogFooter>
          <Button
            onClick={() => create.mutate()}
            disabled={create.isPending || !name.trim()}
            className="w-full"
          >
            הוסף
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
