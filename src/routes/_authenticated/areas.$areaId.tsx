import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { ArrowLeft, ChevronLeft, Pencil, Plus, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const exercisesQO = queryOptions({
  queryKey: ["exercises"],
  queryFn: () => listExercises(),
});

export const Route = createFileRoute("/_authenticated/areas/$areaId")({
  loader: ({ context }) => context.queryClient.ensureQueryData(exercisesQO),
  component: AreaPage,
});

function todayDone(ex: Exercise) {
  const today = new Date().toISOString().slice(0, 10);
  return ex.last_completed_date === today
    ? ex.completed_sets
    : 0;
}

function AreaPage() {
  const { areaId } = Route.useParams();
  const { data: all } = useSuspenseQuery(exercisesQO);
  const list = all.filter((e) => e.area === areaId);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
        <Link to="/areas" className="p-2 -mr-2">
          <ArrowLeft className="size-6 rotate-180" />
        </Link>
        <h1 className="text-xl font-bold flex-1">{areaName(areaId)}</h1>
        <Button size="icon" variant="ghost" onClick={() => setAdding(true)}>
          <Plus className="size-5" />
        </Button>
      </header>

      <div className="p-4 space-y-3">
        {list.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            עוד אין מכשירים. הוסף אחד עם +
          </div>
        )}
        {list.map((ex) => {
          const done = todayDone(ex);
          const remaining = Math.max(0, ex.sets - done);
          const isOpen = expanded === ex.id;
          const finished = remaining === 0;
          return (
            <div
              key={ex.id}
              className={`rounded-2xl border p-4 transition-all ${
                finished
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{ex.name}</div>
                  {!isOpen && !finished && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {ex.weight} ק"ג · {ex.reps} חזרות · {remaining}/{ex.sets} סטים
                    </div>
                  )}
                  {finished && (
                    <div className="text-sm text-emerald-400 font-medium mt-1">
                      ✓ הושלם היום
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(ex)}
                    title="ערוך"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {!finished &&
                    (isOpen ? null : (
                      <Button
                        onClick={() => setExpanded(ex.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                      >
                        <Play className="size-4 ml-1" />
                        התחל
                      </Button>
                    ))}
                </div>
              </div>

              {isOpen && !finished && (
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-4">
                  <div className="grid grid-cols-3 gap-4 flex-1 text-center">
                    <Stat label="משקל" value={`${ex.weight}`} unit='ק"ג' />
                    <Stat label="חזרות" value={`${ex.reps}`} />
                    <Stat label="סטים" value={`${remaining}`} unit={`/${ex.sets}`} />
                  </div>
                  <Link
                    to="/areas/$areaId/exercise/$exerciseId"
                    params={{ areaId, exerciseId: ex.id }}
                    className="size-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-transform active:scale-95"
                    title="התחל סט"
                  >
                    <ChevronLeft className="size-7" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <EditDialog
          exercise={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {adding && (
        <AddDialog
          area={areaId}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tabular-nums">
        {value}
        {unit && <span className="text-sm text-muted-foreground mr-1">{unit}</span>}
      </div>
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
