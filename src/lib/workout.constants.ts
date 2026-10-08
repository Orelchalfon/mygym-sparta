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

export const areaName = (id: string) =>
  AREAS.find((a) => a.id === id)?.name ?? id;

export const REST_SECONDS = 45;

import machine12Asset from "@/assets/facilities/machine-12.jpg.asset.json";
import machine13Asset from "@/assets/facilities/machine-13.jpg.asset.json";
import machine15Asset from "@/assets/facilities/machine-15.jpg.asset.json";

export const FACILITY_IMAGES: Record<string, string> = {
  "מכשיר 12": machine12Asset.url,
  "מכשיר 13": machine13Asset.url,
  "מכשיר 15": machine15Asset.url,
};

export const SEED_EXERCISES: {
  area: AreaId;
  name: string;
  weight: number;
  reps: number;
  sets: number;
  image_url?: string;
}[] = [
  { area: "chest", name: "מכשיר 6", weight: 35, reps: 7, sets: 3 },
  { area: "chest", name: "מכשיר 9", weight: 32, reps: 10, sets: 3 },
  { area: "chest", name: "מכשיר 12", weight: 30, reps: 8, sets: 3, image_url: machine12Asset.url },
  { area: "back", name: "מכשיר 1", weight: 32, reps: 7, sets: 3 },
  { area: "back", name: "מכשיר 9-2", weight: 32, reps: 7, sets: 3 },
  { area: "back", name: "מכשיר 14", weight: 10, reps: 7, sets: 3 },
  { area: "back", name: "מכשיר 15", weight: 20, reps: 10, sets: 3, image_url: machine15Asset.url },
  { area: "legs", name: "מכשיר 2", weight: 20, reps: 7, sets: 3 },
  { area: "legs", name: "מכשיר 8", weight: 32, reps: 7, sets: 3 },
  { area: "legs", name: "מכשיר 13", weight: 40, reps: 8, sets: 3, image_url: machine13Asset.url },
  { area: "shoulders", name: "מכשיר 16", weight: 10, reps: 7, sets: 3 },
  { area: "biceps", name: "מכשיר חדש", weight: 25, reps: 7, sets: 3 },
  { area: "triceps", name: "מכשיר חדש", weight: 25, reps: 7, sets: 3 },
  { area: "abs", name: "מכשיר חדש", weight: 25, reps: 7, sets: 3 },
];

