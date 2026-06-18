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
  completed_sets: number;
  last_completed_date: string | null;
  sort_order: number;
};

export const listExercises = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Exercise[]> => {
    const { supabase, userId } = context;

    let { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("area", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);

    if (!data || data.length === 0) {
      const rows = SEED_EXERCISES.map((e, i) => ({
        user_id: userId,
        area: e.area,
        name: e.name,
        weight: e.weight,
        reps: e.reps,
        sets: e.sets,
        sort_order: i,
      }));
      const ins = await supabase.from("exercises").insert(rows).select("*");
      if (ins.error) throw new Error(ins.error.message);
      data = ins.data;
    }

    return (data ?? []) as Exercise[];
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

export const completeSet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const today = new Date().toISOString().slice(0, 10);

    const { data: ex, error: e1 } = await supabase
      .from("exercises")
      .select("sets, completed_sets, last_completed_date")
      .eq("id", data.id)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!ex) throw new Error("not found");

    const isToday = ex.last_completed_date === today;
    const next = (isToday ? ex.completed_sets : 0) + 1;
    const finished = next >= ex.sets;

    // When all sets are done, reset the counter so the user can do another round
    const newCompleted = finished ? 0 : next;
    const newDate = finished ? null : today;

    const { error: e2 } = await supabase
      .from("exercises")
      .update({ completed_sets: newCompleted, last_completed_date: newDate })
      .eq("id", data.id);
    if (e2) throw new Error(e2.message);
    return { completed_sets: newCompleted, sets: ex.sets, finished };
  });
