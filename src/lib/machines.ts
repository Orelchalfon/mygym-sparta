import type { AreaId } from "@/lib/workout.constants";

import m01 from "@/assets/machines/machine-01.webp";
import m02 from "@/assets/machines/machine-02.webp";
import m03 from "@/assets/machines/machine-03.webp";
import m04 from "@/assets/machines/machine-04.webp";
import m05 from "@/assets/machines/machine-05.webp";
import m06 from "@/assets/machines/machine-06.webp";
import m07 from "@/assets/machines/machine-07.webp";
import m08 from "@/assets/machines/machine-08.webp";
import m09 from "@/assets/machines/machine-09.webp";
import m10 from "@/assets/machines/machine-10.webp";
import m11 from "@/assets/machines/machine-11.webp";
import m12 from "@/assets/machines/machine-12.webp";
import m13 from "@/assets/machines/machine-13.webp";
import m14 from "@/assets/machines/machine-14.webp";
import m15 from "@/assets/machines/machine-15.webp";
import m16 from "@/assets/machines/machine-16.webp";
import m17 from "@/assets/machines/machine-17.webp";
import m18 from "@/assets/machines/machine-18.webp";
import m19 from "@/assets/machines/machine-19.webp";
import m20 from "@/assets/machines/machine-20.webp";
import m21 from "@/assets/machines/machine-21.webp";
import m22 from "@/assets/machines/machine-22.webp";
import m23 from "@/assets/machines/machine-23.webp";
import m24 from "@/assets/machines/machine-24.webp";
import m25 from "@/assets/machines/machine-25.webp";
import m26 from "@/assets/machines/machine-26.webp";
import m27 from "@/assets/machines/machine-27.webp";
import m28 from "@/assets/machines/machine-28.webp";

/**
 * Static catalog of the gym's numbered machines. Keyed by the number painted on
 * the machine so it can later move into a `machines` table without remapping.
 * Exercises link to a machine through the number in their name ("מכשיר 6").
 */
export type Machine = {
  number: number;
  nameHe: string;
  nameEn: string;
  image: string;
  areas: AreaId[];
  /** CSS object-position when the machine isn't centered in the photo. */
  objectPosition?: string;
};

const list: Machine[] = [
  {
    number: 1,
    nameHe: "פולי עליון וחתירה",
    nameEn: "Lat Pulldown & Seated Row",
    image: m01,
    areas: ["back"],
  },
  {
    number: 2,
    nameHe: "הרמת ברכיים ומקבילים",
    nameEn: "Vertical Knee Raise & Dip",
    image: m02,
    areas: ["abs", "triceps"],
  },
  { number: 3, nameHe: "כפיפות בטן", nameEn: "Abdominal Crunch", image: m03, areas: ["abs"] },
  { number: 4, nameHe: "פרפר (פק דק)", nameEn: "Pec Deck Butterfly", image: m04, areas: ["chest"] },
  { number: 5, nameHe: "לחיצת כתפיים", nameEn: "Shoulder Press", image: m05, areas: ["shoulders"] },
  { number: 6, nameHe: "לחיצת חזה", nameEn: "Chest Press", image: m06, areas: ["chest"] },
  {
    number: 7,
    nameHe: "פשיטת וכפיפת ברכיים",
    nameEn: "Leg Extension & Leg Curl",
    image: m07,
    areas: ["legs"],
  },
  {
    number: 8,
    nameHe: "מקרבים ומרחיקים",
    nameEn: "Abductor & Adductor",
    image: m08,
    areas: ["legs"],
  },
  {
    number: 9,
    nameHe: "פרפר וכתף אחורית",
    nameEn: "Pec Fly & Rear Delt",
    image: m09,
    areas: ["chest", "back", "shoulders"],
  },
  {
    number: 10,
    nameHe: "חתירה גבוהה",
    nameEn: "High Row (Plate Loaded)",
    image: m10,
    areas: ["back"],
  },
  {
    number: 11,
    nameHe: "פולי עליון (צלחות)",
    nameEn: "Lat Pulldown (Plate Loaded)",
    image: m11,
    areas: ["back"],
  },
  {
    number: 12,
    nameHe: "לחיצת חזה בשיפוע",
    nameEn: "Incline Chest Press (Plate Loaded)",
    image: m12,
    areas: ["chest"],
  },
  {
    number: 13,
    nameHe: "חתירה בישיבה (צלחות)",
    nameEn: "Seated Row (Plate Loaded)",
    image: m13,
    areas: ["back"],
  },
  { number: 14, nameHe: "חתירת T-Bar", nameEn: "T-Bar Row", image: m14, areas: ["back"] },
  {
    number: 15,
    nameHe: "מכשיר כבלים (קרוסאובר)",
    nameEn: "Functional Trainer",
    image: m15,
    areas: ["chest", "shoulders", "biceps", "triceps"],
  },
  { number: 16, nameHe: "הרחקת כתפיים", nameEn: "Lateral Raise", image: m16, areas: ["shoulders"] },
  { number: 17, nameHe: "פשיטת גב 45°", nameEn: "Back Extension 45", image: m17, areas: ["back"] },
  { number: 18, nameHe: "GHD", nameEn: "Glute Ham Developer", image: m18, areas: ["legs", "abs"] },
  { number: 19, nameHe: "היפ תראסט", nameEn: "Hip Thrust", image: m19, areas: ["legs"] },
  { number: 20, nameHe: "תאומים בישיבה", nameEn: "Seated Calf Raise", image: m20, areas: ["legs"] },
  {
    number: 21,
    nameHe: "סקוואט ולאנג׳",
    nameEn: "Squat Lunge (Ground Base)",
    image: m21,
    areas: ["legs"],
  },
  { number: 22, nameHe: "האק סקוואט", nameEn: "Hack Squat", image: m22, areas: ["legs"] },
  {
    number: 23,
    nameHe: "ספסל לחיצה בשיפוע",
    nameEn: "Incline Bench Press",
    image: m23,
    areas: ["chest"],
  },
  {
    number: 24,
    nameHe: "ספסל לחיצה ישר",
    nameEn: "Flat Bench Press",
    image: m24,
    areas: ["chest", "triceps"],
  },
  { number: 25, nameHe: "ספסל סקוט", nameEn: "Preacher Curl", image: m25, areas: ["biceps"] },
  {
    number: 26,
    nameHe: "מכונת סמית׳",
    nameEn: "Smith Machine",
    image: m26,
    areas: ["legs", "chest", "shoulders"],
  },
  { number: 27, nameHe: "מתקן סקוואט", nameEn: "Squat Rack", image: m27, areas: ["legs"] },
  { number: 28, nameHe: "חצי מתקן", nameEn: "Half Rack", image: m28, areas: ["legs", "shoulders"] },
];

export const MACHINES: ReadonlyMap<number, Machine> = new Map(list.map((m) => [m.number, m]));
export const MACHINE_LIST: readonly Machine[] = list;

/** Cover photo for each area tile; areas without one fall back to the brand tile. */
const AREA_COVER: Partial<Record<AreaId, number>> = {
  chest: 12,
  back: 11,
  legs: 22,
  shoulders: 16,
  biceps: 25,
  triceps: 2,
  abs: 3,
};

export const areaCover = (area: string) => {
  const n = AREA_COVER[area as AreaId];
  return n ? MACHINES.get(n) : undefined;
};

/** First integer in the name: "מכשיר 9-2" → 9, "מכשיר6" → 6, "מכשיר חדש" → null. */
export function machineNumberFromName(name: string): number | null {
  const m = name.match(/\d+/);
  return m ? Number(m[0]) : null;
}

export function getMachine(name: string): Machine | undefined {
  const n = machineNumberFromName(name);
  return n === null ? undefined : MACHINES.get(n);
}

/** Canonical exercise name written by the machine picker. */
export const machineExerciseName = (n: number) => `מכשיר ${n}`;

/** Machines for an area first, then the rest — for the picker. */
export function machinesForArea(area: string) {
  const inArea = list.filter((m) => m.areas.includes(area as AreaId));
  const rest = list.filter((m) => !m.areas.includes(area as AreaId));
  return { inArea, rest };
}
