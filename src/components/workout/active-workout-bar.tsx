import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { finishSession, type ActiveSession } from "@/lib/workout.functions";
import { activeSessionQO } from "@/lib/workout.queries";

/** Shown on the areas screen while a workout is in progress. */
export function ActiveWorkoutBar({ session }: { session: ActiveSession }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const finishFn = useServerFn(finishSession);
  const [busy, setBusy] = useState(false);
  const started = new Date(session.started_at).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function finish() {
    if (busy) return;
    setBusy(true);
    try {
      await finishFn({ data: { sessionId: session.id } });
      qc.setQueryData(activeSessionQO.queryKey, null);
      qc.invalidateQueries({ queryKey: ["sessions"] });
      navigate({ to: "/history/$sessionId", params: { sessionId: session.id } });
    } catch {
      toast.error("לא הצלחנו לסיים את האימון. נסו שוב.");
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="אימון פעיל"
      className="mb-5 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-3 ps-4"
    >
      <span aria-hidden className="relative flex size-2.5 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-bold">אימון פעיל</div>
        <div className="text-sm text-muted-foreground tabular-nums">
          {session.total_sets === 1 ? "סט אחד" : `${session.total_sets} סטים`} · התחיל ב־
          {started}
        </div>
      </div>
      <Button size="touch" onClick={finish} disabled={busy} className="shrink-0 font-bold">
        {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Flag aria-hidden />}
        סיים אימון
      </Button>
    </section>
  );
}
