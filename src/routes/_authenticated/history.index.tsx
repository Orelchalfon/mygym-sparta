import { createFileRoute, Link } from "@tanstack/react-router";
import { infiniteQueryOptions, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, Clock, Dumbbell, Loader2 } from "lucide-react";
import { listSessions } from "@/lib/workout.functions";
import { getMachine } from "@/lib/machines";
import {
  formatSessionDate,
  formatTime,
  groupByExercise,
  sessionMinutes,
} from "@/lib/workout.format";
import { AppHeader } from "@/components/app-header";
import { UserActions } from "@/components/user-actions";
import { Button } from "@/components/ui/button";

const sessionsQO = infiniteQueryOptions({
  queryKey: ["sessions", "list"],
  queryFn: ({ pageParam }) => listSessions({ data: { before: pageParam } }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (last) => (last.hasMore ? last.sessions.at(-1)?.started_at : undefined),
});

export const Route = createFileRoute("/_authenticated/history/")({
  loader: ({ context }) => context.queryClient.ensureInfiniteQueryData(sessionsQO),
  head: () => ({
    meta: [{ title: "היסטוריית אימונים — ספרטא" }, { name: "robots", content: "noindex" }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(sessionsQO);
  const sessions = data.pages.flatMap((p) => p.sessions);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AppHeader
        back={{ to: "/areas", label: "חזרה לאזורי האימון" }}
        eyebrow="ספרטא"
        title="היסטוריית אימונים"
        actions={<UserActions />}
      />

      <main className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays className="size-8" aria-hidden />
            </div>
            <p className="mt-4 text-lg font-bold">עוד אין אימונים שמורים</p>
            <p className="mt-1 text-muted-foreground">
              כל סט שתסיימו יישמר כאן, גם אחרי רענון או החלפת מכשיר
            </p>
            <Link
              to="/areas"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-bold text-primary-foreground"
            >
              להתחיל להתאמן
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {sessions.map((s) => {
                const groups = groupByExercise(s.set_logs);
                const names = groups.map((g) => getMachine(g.name)?.nameHe ?? g.name);
                return (
                  <li key={s.id}>
                    <Link
                      to="/history/$sessionId"
                      params={{ sessionId: s.id }}
                      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{formatSessionDate(s.started_at)}</span>
                          {s.status === "active" && (
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                              פעיל
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground tabular-nums">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" aria-hidden />
                            {formatTime(s.started_at)} · {sessionMinutes(s)} דק׳
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Dumbbell className="size-3.5" aria-hidden />
                            {s.set_logs.length === 1 ? "סט אחד" : `${s.set_logs.length} סטים`}
                          </span>
                        </div>
                        {names.length > 0 && (
                          <p className="mt-1.5 truncate text-sm">{names.join(" · ")}</p>
                        )}
                      </div>
                      <ChevronLeft
                        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
            {hasNextPage && (
              <Button
                variant="outline"
                size="touch"
                className="mt-4 w-full"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage && <Loader2 className="animate-spin" aria-hidden />}
                טען עוד
              </Button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
