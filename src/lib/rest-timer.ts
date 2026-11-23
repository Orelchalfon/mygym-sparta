/**
 * Rest between sets. We store when the rest ends (a timestamp), never a
 * countdown, so it survives refresh, screen lock and background throttling.
 */
export type Rest = { endsAt: number; total: number };

export const restKey = (exerciseId: string) => `sparta:rest:${exerciseId}`;

export function startRest(now: number, seconds: number): Rest {
  return { endsAt: now + seconds * 1000, total: seconds };
}

/** "+15 שניות": pushes the end and grows the ring's total by the same amount. */
export function extendRest(rest: Rest, seconds: number): Rest {
  return { endsAt: rest.endsAt + seconds * 1000, total: rest.total + seconds };
}

export const restRemainingMs = (rest: Rest, now: number) => Math.max(0, rest.endsAt - now);

/** 0 → 1 as the rest elapses; clamped. */
export function restProgress(rest: Rest, now: number): number {
  const frac = 1 - restRemainingMs(rest, now) / (rest.total * 1000);
  return Math.min(1, Math.max(0, frac));
}

/** Restores a stored rest; anything malformed or already over is dropped. */
export function parseStoredRest(raw: string | null, now: number): Rest | null {
  if (!raw) return null;
  try {
    const r = JSON.parse(raw) as Partial<Rest>;
    if (typeof r.endsAt !== "number" || typeof r.total !== "number" || r.total <= 0) return null;
    return r.endsAt > now ? { endsAt: r.endsAt, total: r.total } : null;
  } catch {
    return null;
  }
}
