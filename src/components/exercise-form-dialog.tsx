import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createExercise,
  deleteExercise,
  updateExercise,
  type Exercise,
} from "@/lib/workout.functions";
import {
  machineExerciseName,
  machineNumberFromName,
  machinesForArea,
  type Machine,
} from "@/lib/machines";
import { areaName } from "@/lib/workout.constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<"name" | "weight" | "reps" | "sets", string>>;

/** "35.0" → "35", keeps one decimal for plate math (2.5). */
const fmt = (n: number) => String(Math.round(n * 10) / 10);

function validate(name: string, weight: string, reps: string, sets: string) {
  const errors: Errors = {};
  const w = Number(weight);
  const r = Number(reps);
  const s = Number(sets);
  if (!name.trim()) errors.name = "בחרו מכשיר או הזינו שם";
  if (weight.trim() === "" || !Number.isFinite(w) || w < 0) errors.weight = "הזינו משקל של 0 ומעלה";
  if (reps.trim() === "" || !Number.isInteger(r) || r < 1) errors.reps = "מספר שלם, 1 ומעלה";
  if (sets.trim() === "" || !Number.isInteger(s) || s < 1) errors.sets = "מספר שלם, 1 ומעלה";
  return { errors, values: { name: name.trim(), weight: w, reps: r, sets: s } };
}

interface ExerciseFormDialogProps {
  area: string;
  /** Present → edit mode (with delete); absent → add mode. */
  exercise?: Exercise;
  onClose: () => void;
}

export function ExerciseFormDialog({ area, exercise, onClose }: ExerciseFormDialogProps) {
  const isEdit = !!exercise;
  const qc = useQueryClient();
  const createFn = useServerFn(createExercise);
  const updateFn = useServerFn(updateExercise);
  const deleteFn = useServerFn(deleteExercise);

  const [name, setName] = useState(exercise?.name ?? "");
  const [weight, setWeight] = useState(String(exercise?.weight ?? 25));
  const [reps, setReps] = useState(String(exercise?.reps ?? 8));
  const [sets, setSets] = useState(String(exercise?.sets ?? 3));
  const [errors, setErrors] = useState<Errors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const done = (msg: string) => {
    qc.invalidateQueries({ queryKey: ["exercises"] });
    toast.success(msg);
    onClose();
  };

  const save = useMutation({
    mutationFn: (v: ReturnType<typeof validate>["values"]) =>
      exercise ? updateFn({ data: { id: exercise.id, ...v } }) : createFn({ data: { area, ...v } }),
    onSuccess: () => done(isEdit ? "השינויים נשמרו" : "המכשיר נוסף"),
    onError: () => toast.error("השמירה נכשלה. בדקו את החיבור ונסו שוב."),
  });

  const del = useMutation({
    mutationFn: () => deleteFn({ data: { id: exercise!.id } }),
    onSuccess: () => done("המכשיר נמחק"),
    onError: () => toast.error("המחיקה נכשלה. נסו שוב."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const { errors, values } = validate(name, weight, reps, sets);
    setErrors(errors);
    const first = (["name", "weight", "reps", "sets"] as const).find((k) => errors[k]);
    if (first) {
      document.getElementById(`ex-${first}`)?.focus();
      return;
    }
    save.mutate(values);
  }

  const busy = save.isPending || del.isPending;

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
        <DialogContent dir="rtl" className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {isEdit ? "עריכת מכשיר" : `הוספת מכשיר · ${areaName(area)}`}
            </DialogTitle>
            <DialogDescription>
              בחרו את המכשיר מהתמונות, ואז כוונו משקל, חזרות וסטים.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
            <MachinePicker
              area={area}
              selected={machineNumberFromName(name)}
              onPick={(m) => {
                setName(machineExerciseName(m.number));
                setErrors((e) => ({ ...e, name: undefined }));
              }}
            />

            <div className="flex flex-col gap-2">
              <Label htmlFor="ex-name">שם התרגיל</Label>
              <Input
                id="ex-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="מכשיר 6"
                maxLength={60}
                aria-invalid={!!errors.name || undefined}
                aria-describedby="ex-name-hint"
                className="h-11"
              />
              <p
                id="ex-name-hint"
                role={errors.name ? "alert" : undefined}
                className={cn(
                  "text-xs",
                  errors.name ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {errors.name ?? "המספר בשם (למשל ״מכשיר 6״) מקשר את התרגיל לתמונת המכשיר."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <NumberStepper
                id="ex-weight"
                label='משקל (ק"ג)'
                value={weight}
                onChange={setWeight}
                step={2.5}
                min={0}
                decimal
                error={errors.weight}
              />
              <NumberStepper
                id="ex-reps"
                label="חזרות"
                value={reps}
                onChange={setReps}
                step={1}
                min={1}
                error={errors.reps}
              />
              <NumberStepper
                id="ex-sets"
                label="סטים"
                value={sets}
                onChange={setSets}
                step={1}
                min={1}
                error={errors.sets}
              />
            </div>

            <DialogFooter className="mt-1 gap-3 sm:justify-between">
              {isEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="touch"
                  onClick={() => setConfirmDelete(true)}
                  disabled={busy}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 aria-hidden />
                  מחיקה
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              <Button type="submit" size="touch" disabled={busy} className="font-bold sm:min-w-40">
                {save.isPending ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : (
                  <Check aria-hidden />
                )}
                {save.isPending ? "שומר..." : isEdit ? "שמירה" : "הוספה"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isEdit && (
        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>למחוק את {exercise.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                המכשיר והנתונים שלו (משקל, חזרות וסטים) יימחקו לצמיתות.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-11">ביטול</AlertDialogCancel>
              <AlertDialogAction
                className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={(e) => {
                  e.preventDefault();
                  del.mutate();
                }}
                disabled={del.isPending}
              >
                {del.isPending && <Loader2 className="animate-spin" aria-hidden />}
                מחיקה
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

function MachinePicker({
  area,
  selected,
  onPick,
}: {
  area: string;
  selected: number | null;
  onPick: (m: Machine) => void;
}) {
  const { inArea, rest } = machinesForArea(area);
  // Start on "all" when the current machine isn't one of this area's.
  const [showAll, setShowAll] = useState(
    inArea.length === 0 || (selected !== null && !inArea.some((m) => m.number === selected)),
  );
  const shown = showAll ? [...inArea, ...rest] : inArea;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span id="ex-machine-label" className="text-sm font-medium">
          מכשיר
        </span>
        {inArea.length > 0 && (
          <Button
            type="button"
            variant="link"
            className="h-11 px-1"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? `רק ${areaName(area)}` : "כל המכשירים"}
          </Button>
        )}
      </div>
      <div
        role="radiogroup"
        aria-labelledby="ex-machine-label"
        className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto overscroll-contain rounded-xl sm:grid-cols-4"
      >
        {shown.map((m) => {
          const active = m.number === selected;
          return (
            <button
              key={m.number}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`מכשיר ${m.number} — ${m.nameHe}`}
              onClick={() => onPick(m)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-xl border-2 bg-muted text-start transition-[border-color,transform] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active ? "border-primary" : "border-transparent",
              )}
            >
              <img
                src={m.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
              />
              <span className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute start-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-bold text-white tabular-nums">
                {m.number}
              </span>
              {active && (
                <span className="absolute end-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" aria-hidden />
                </span>
              )}
              <span className="absolute inset-x-1.5 bottom-1.5 line-clamp-2 text-[11px] font-semibold leading-tight text-white">
                {m.nameHe}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumberStepper({
  id,
  label,
  value,
  onChange,
  step,
  min,
  decimal,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  step: number;
  min: number;
  decimal?: boolean;
  error?: string;
}) {
  const n = Number(value);
  const bump = (d: number) => {
    const base = Number.isFinite(n) && value.trim() !== "" ? n : min;
    onChange(fmt(Math.max(min, base + d)));
  };
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {/* Physical order − value + reads naturally for numbers in both directions. */}
      <div dir="ltr" className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon-touch"
          onClick={() => bump(-step)}
          disabled={Number.isFinite(n) && n <= min}
          aria-label={`הפחת ${label}`}
        >
          <Minus aria-hidden />
        </Button>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={decimal ? "decimal" : "numeric"}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-11 min-w-0 flex-1 text-center text-lg font-bold tabular-nums"
        />
        <Button
          type="button"
          variant="outline"
          size="icon-touch"
          onClick={() => bump(step)}
          aria-label={`הוסף ${label}`}
        >
          <Plus aria-hidden />
        </Button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
