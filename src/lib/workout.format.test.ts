import { describe, expect, it } from "vitest";
import type { SetLog, WorkoutSession } from "./workout.functions";
import { groupByExercise, sessionMinutes, sessionVolume } from "./workout.format";

const log = (o: Partial<SetLog>): SetLog =>
  ({
    exercise_id: "e1",
    exercise_name: "לחיצת חזה",
    area: "chest",
    weight: 50,
    reps: 10,
    completed_at: "2026-10-12T10:00:00Z",
    ...o,
  }) as SetLog;

const session = (o: Partial<WorkoutSession>): WorkoutSession =>
  ({
    started_at: "2026-10-12T10:00:00Z",
    completed_at: null,
    set_logs: [],
    ...o,
  }) as WorkoutSession;

describe("sessionVolume", () => {
  it("sums weight × reps, accepting numeric strings from Postgres", () => {
    expect(
      sessionVolume([log({ weight: 50, reps: 10 }), log({ weight: "22.5" as never, reps: 8 })]),
    ).toBe(680);
  });
  it("is 0 with no sets", () => expect(sessionVolume([])).toBe(0));
});

describe("sessionMinutes", () => {
  it("uses completed_at when the session is finished", () => {
    expect(sessionMinutes(session({ completed_at: "2026-10-12T10:42:00Z" }))).toBe(42);
  });
  it("uses the last set while still active", () => {
    const s = session({ set_logs: [log({ completed_at: "2026-10-12T10:17:00Z" })] });
    expect(sessionMinutes(s)).toBe(17);
  });
  it("never shows less than one minute", () => {
    expect(sessionMinutes(session({}))).toBe(1);
  });
});

describe("groupByExercise", () => {
  it("groups sets by exercise in first-done order", () => {
    const groups = groupByExercise([
      log({ exercise_id: "b", exercise_name: "B", completed_at: "2026-10-12T10:05:00Z" }),
      log({ exercise_id: "a", exercise_name: "A", completed_at: "2026-10-12T10:01:00Z" }),
      log({ exercise_id: "b", exercise_name: "B", completed_at: "2026-10-12T10:06:00Z" }),
      log({ exercise_id: "a", exercise_name: "A", completed_at: "2026-10-12T10:02:00Z" }),
    ]);
    expect(groups.map((g) => [g.name, g.sets.length])).toEqual([
      ["A", 2],
      ["B", 2],
    ]);
  });
  it("keeps deleted exercises apart by area + name", () => {
    const groups = groupByExercise([
      log({ exercise_id: null as never, exercise_name: "X", area: "legs" }),
      log({ exercise_id: null as never, exercise_name: "X", area: "back" }),
    ]);
    expect(groups).toHaveLength(2);
  });
});
