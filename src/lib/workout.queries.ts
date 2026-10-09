import { queryOptions } from "@tanstack/react-query";
import { getActiveSession, getSession, listExercises } from "./workout.functions";

/** The user's exercise catalog and saved weight/reps. Changes rarely. */
export const exercisesQO = queryOptions({
  queryKey: ["exercises"],
  queryFn: () => listExercises(),
  staleTime: 5 * 60_000,
});

/** The in-progress workout (null when none). Invalidated after every set. */
export const activeSessionQO = queryOptions({
  queryKey: ["session", "active"],
  queryFn: () => getActiveSession(),
});

export const sessionQO = (id: string) =>
  queryOptions({
    queryKey: ["sessions", id],
    queryFn: () => getSession({ data: { id } }),
  });
