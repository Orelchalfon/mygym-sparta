import type { SetLog, WorkoutSession } from "./workout.functions";

/** Dates/times in the viewer's own timezone, Hebrew formatting. */
export const formatSessionDate = (iso: string) =>
  new Date(iso).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

/** Wall time from start to the end (or the last set while still active). */
export function sessionMinutes(s: WorkoutSession): number {
  const last = s.set_logs.reduce(
    (max, l) => Math.max(max, Date.parse(l.completed_at)),
    Date.parse(s.started_at),
  );
  const end = s.completed_at ? Date.parse(s.completed_at) : last;
  return Math.max(1, Math.round((end - Date.parse(s.started_at)) / 60_000));
}

export type ExerciseGroup = { key: string; name: string; area: string; sets: SetLog[] };

/** Sets grouped by exercise, in the order the exercises were first done. */
export function groupByExercise(logs: SetLog[]): ExerciseGroup[] {
  const sorted = [...logs].sort((a, b) => a.completed_at.localeCompare(b.completed_at));
  const groups = new Map<string, ExerciseGroup>();
  for (const l of sorted) {
    const key = l.exercise_id ?? `${l.area}:${l.exercise_name}`;
    let g = groups.get(key);
    if (!g) {
      g = { key, name: l.exercise_name, area: l.area, sets: [] };
      groups.set(key, g);
    }
    g.sets.push(l);
  }
  return [...groups.values()];
}

/** Total kg moved: Σ weight × reps. */
export const sessionVolume = (logs: SetLog[]) =>
  Math.round(logs.reduce((sum, l) => sum + Number(l.weight) * l.reps, 0));
