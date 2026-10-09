import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { SEED_EXERCISES } from "./workout.constants";

export type Exercise = {
  id: string;
  area: string;
  name: string;
  weight: number;
  reps: number;
  sets: number;
  sort_order: number;
};

export const listExercises = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Exercise[]> => {
    const { supabase } = context;
    const select = () =>
      supabase
        .from("exercises")
        .select("id, area, name, weight, reps, sets, sort_order")
        .order("area", { ascending: true })
        .order("sort_order", { ascending: true });

    const { data, error } = await select();
    if (error) throw new Error(error.message);
    if (data.length > 0) return data;

    // First visit: seed the defaults. The RPC is a no-op if rows already exist,
    // so concurrent first loads can't create duplicates.
    const seed = await supabase.rpc("seed_default_exercises", { p_rows: SEED_EXERCISES });
    if (seed.error) throw new Error(seed.error.message);
    const again = await select();
    if (again.error) throw new Error(again.error.message);
    return again.data;
  });

export const createExercise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        area: z.string(),
        name: z.string().min(1),
        weight: z.number().nonnegative(),
        reps: z.number().int().positive(),
        sets: z.number().int().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("exercises").insert({
      user_id: userId,
      area: data.area,
      name: data.name,
      weight: data.weight,
      reps: data.reps,
      sets: data.sets,
      sort_order: Date.now() % 1000000,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateExercise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1),
        weight: z.number().nonnegative(),
        reps: z.number().int().positive(),
        sets: z.number().int().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("exercises")
      .update({
        name: data.name,
        weight: data.weight,
        reps: data.reps,
        sets: data.sets,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteExercise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("exercises").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type LogSetResult = {
  session_id: string;
  set_number: number;
  target_sets: number;
  /** A full round of the exercise's sets was just completed. */
  finished: boolean;
};

/** "סיימתי סט" — atomic and idempotent per clientEventId (see log_set in the migrations). */
export const logSet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ exerciseId: z.string().uuid(), clientEventId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }): Promise<LogSetResult> => {
    const { data: res, error } = await context.supabase.rpc("log_set", {
      p_exercise_id: data.exerciseId,
      p_client_event_id: data.clientEventId,
    });
    if (error) throw new Error(error.message);
    return res as LogSetResult;
  });

export type ActiveSession = {
  id: string;
  started_at: string;
  total_sets: number;
  /** Sets done in this session, by exercise id. */
  counts: Record<string, number>;
};

export const getActiveSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ActiveSession | null> => {
    const { data, error } = await context.supabase.rpc("get_active_session");
    if (error) throw new Error(error.message);
    return (data as ActiveSession | null) ?? null;
  });

export const finishSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("finish_session", {
      p_session_id: data.sessionId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type SetLog = {
  id: string;
  exercise_id: string | null;
  exercise_name: string;
  area: string;
  set_number: number;
  weight: number;
  reps: number;
  completed_at: string;
};

export type WorkoutSession = {
  id: string;
  status: "active" | "completed";
  started_at: string;
  completed_at: string | null;
  set_logs: SetLog[];
};

const SESSION_SELECT =
  "id, status, started_at, completed_at, set_logs(id, exercise_id, exercise_name, area, set_number, weight, reps, completed_at)";

const HISTORY_PAGE = 20;

/** Sessions newest first; pass the last started_at as `before` for the next page. */
export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ before: z.string().datetime({ offset: true }).optional() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }): Promise<{ sessions: WorkoutSession[]; hasMore: boolean }> => {
    let q = context.supabase
      .from("workout_sessions")
      .select(SESSION_SELECT)
      .order("started_at", { ascending: false })
      .limit(HISTORY_PAGE + 1);
    if (data.before) q = q.lt("started_at", data.before);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const sessions = rows as unknown as WorkoutSession[];
    return { sessions: sessions.slice(0, HISTORY_PAGE), hasMore: sessions.length > HISTORY_PAGE };
  });

export const getSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<WorkoutSession | null> => {
    const { data: row, error } = await context.supabase
      .from("workout_sessions")
      .select(SESSION_SELECT)
      .eq("id", data.id)
      .order("completed_at", { referencedTable: "set_logs", ascending: true })
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as unknown as WorkoutSession | null;
  });
