export type AreaId =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "abs"
  | "stretch";

export const AREAS: { id: AreaId; name: string; emoji: string }[] = [
  { id: "chest", name: "חזה", emoji: "💪" },
  { id: "back", name: "גב", emoji: "🛡️" },
  { id: "legs", name: "רגליים", emoji: "🦵" },
  { id: "shoulders", name: "כתפיים", emoji: "🏋️" },
  { id: "biceps", name: "יד קדמית", emoji: "💪" },
  { id: "triceps", name: "יד אחורית", emoji: "🤜" },
  { id: "abs", name: "בטן", emoji: "🔥" },
  { id: "stretch", name: "מתיחות", emoji: "🧘" },
];

/** The user's own name first, then the built-in default; never shows a raw key (custom keys are uuids). */
export const areaName = (id: string, areas?: readonly { key: string; name: string }[]) =>
  areas?.find((a) => a.key === id)?.name ?? AREAS.find((a) => a.id === id)?.name ?? "אזור אימון";

export const REST_SECONDS = 45;

export const SEED_EXERCISES: {
  area: AreaId;
  name: string;
  weight: number;
  reps: number;
  sets: number;
}[] = [
  { area: "chest", name: "מכשיר 6", weight: 35, reps: 7, sets: 3 },
  { area: "chest", name: "מכשיר 9", weight: 32, reps: 10, sets: 3 },
  { area: "chest", name: "מכשיר 12", weight: 30, reps: 8, sets: 3 },
  { area: "back", name: "מכשיר 1", weight: 32, reps: 7, sets: 3 },
  { area: "back", name: "מכשיר 9-2", weight: 32, reps: 7, sets: 3 },
  { area: "back", name: "מכשיר 14", weight: 10, reps: 7, sets: 3 },
  { area: "back", name: "מכשיר 15", weight: 20, reps: 10, sets: 3 },
  { area: "legs", name: "מכשיר 2", weight: 20, reps: 7, sets: 3 },
  { area: "legs", name: "מכשיר 8", weight: 32, reps: 7, sets: 3 },
  { area: "legs", name: "מכשיר 13", weight: 40, reps: 8, sets: 3 },
  { area: "shoulders", name: "מכשיר 16", weight: 10, reps: 7, sets: 3 },
  { area: "biceps", name: "מכשיר חדש", weight: 25, reps: 7, sets: 3 },
  { area: "triceps", name: "מכשיר חדש", weight: 25, reps: 7, sets: 3 },
  { area: "abs", name: "מכשיר חדש", weight: 25, reps: 7, sets: 3 },
];
