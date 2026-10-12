import { describe, expect, it } from "vitest";
import {
  extendRest,
  parseStoredRest,
  restProgress,
  restRemainingMs,
  startRest,
} from "./rest-timer";

const T0 = 1_760_000_000_000;

describe("rest timer", () => {
  it("ends `seconds` after it starts", () => {
    const r = startRest(T0, 45);
    expect(r).toEqual({ endsAt: T0 + 45_000, total: 45 });
    expect(restRemainingMs(r, T0 + 10_000)).toBe(35_000);
  });

  it("never reports negative time once over", () => {
    expect(restRemainingMs(startRest(T0, 45), T0 + 60_000)).toBe(0);
  });

  it("+15s pushes the end and the ring total together", () => {
    const r = extendRest(startRest(T0, 45), 15);
    expect(r).toEqual({ endsAt: T0 + 60_000, total: 60 });
    expect(restProgress(r, T0 + 30_000)).toBeCloseTo(0.5);
  });

  it("clamps progress to 0..1", () => {
    const r = startRest(T0, 45);
    expect(restProgress(r, T0)).toBe(0);
    expect(restProgress(r, T0 + 90_000)).toBe(1);
  });
});

describe("parseStoredRest (resume after refresh)", () => {
  const stored = JSON.stringify(startRest(T0, 45));

  it("resumes a rest that is still running", () => {
    expect(parseStoredRest(stored, T0 + 20_000)).toEqual({ endsAt: T0 + 45_000, total: 45 });
  });

  it("drops a rest that ended while the app was closed", () => {
    expect(parseStoredRest(stored, T0 + 45_000)).toBeNull();
  });

  it.each([null, "", "not json", "{}", '{"endsAt":"soon","total":45}', '{"endsAt":1,"total":0}'])(
    "drops malformed value %j",
    (raw) => {
      expect(parseStoredRest(raw, T0)).toBeNull();
    },
  );
});
