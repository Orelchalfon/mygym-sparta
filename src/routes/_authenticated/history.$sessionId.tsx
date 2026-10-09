import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getMachine } from "@/lib/machines";
import { areaName } from "@/lib/workout.constants";
import { sessionQO } from "@/lib/workout.queries";
import {
  formatSessionDate,
  formatTime,
  groupByExercise,
  sessionMinutes,
  sessionVolume,
} from "@/lib/workout.format";
import { AppHeader } from "@/components/app-header";
import { UserActions } from "@/components/user-actions";
import { MachineImage } from "@/components/machine-image";

export const Route = createFileRoute("/_authenticated/history/$sessionId")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(sessionQO(params.sessionId)),
  head: () => ({
    meta: [{ title: "סיכום אימון — ספרטא" }, { name: "robots", content: "noindex" }],
  }),
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const { data: session } = useSuspenseQuery(sessionQO(sessionId));

  if (!session) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-lg font-bold">האימון לא נמצא</p>
        <Link to="/history" className="font-bold text-primary underline-offset-4 hover:underline">
          חזרה להיסטוריה
        </Link>
      </div>
    );
  }

  const groups = groupByExercise(session.set_logs);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AppHeader
        back={{ to: "/history", label: "חזרה להיסטוריית האימונים" }}
        eyebrow={session.status === "active" ? "אימון פעיל" : "סיכום אימון"}
        title={formatSessionDate(session.started_at)}
        actions={<UserActions />}
      />

      <main className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        <dl className="grid grid-cols-3 divide-x divide-x-reverse divide-border rounded-3xl border border-border bg-card py-5 text-center shadow-sm">
          <Stat label="התחלה" value={formatTime(session.started_at)} />
          <Stat label="משך" value={`${sessionMinutes(session)}`} unit="דקות" />
          <Stat label="סטים" value={`${session.set_logs.length}`} />
        </dl>
        <p className="mt-3 text-center text-sm text-muted-foreground tabular-nums">
          נפח כולל: {sessionVolume(session.set_logs).toLocaleString("he-IL")} ק״ג
        </p>

        <ul className="mt-6 flex flex-col gap-3">
          {groups.map((g) => {
            const machine = getMachine(g.name);
            return (
              <li key={g.key} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <MachineImage
                    machine={machine}
                    label={g.name}
                    className="size-14 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate font-bold">{machine?.nameHe ?? g.name}</h2>
                    <p className="truncate text-sm text-muted-foreground">
                      {areaName(g.area)}
                      {machine && ` · מכשיר ${machine.number}`}
                    </p>
                  </div>
                </div>
                <ol className="mt-3 flex flex-col divide-y divide-border text-sm">
                  {g.sets.map((l, i) => (
                    <li key={l.id} className="flex items-center justify-between py-2 tabular-nums">
                      <span className="text-muted-foreground">סט {i + 1}</span>
                      <span className="font-bold">
                        <bdi>{Number(l.weight)}</bdi> ק״ג × <bdi>{l.reps}</bdi>
                      </span>
                      <span className="text-muted-foreground">{formatTime(l.completed_at)}</span>
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="px-2">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-black tabular-nums">{value}</dd>
      {unit && <dd className="text-xs text-muted-foreground">{unit}</dd>}
    </div>
  );
}
