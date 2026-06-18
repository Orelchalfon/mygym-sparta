import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { listExercises } from "@/lib/workout.functions";
import { AREAS } from "@/lib/workout.constants";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";

const exercisesQO = queryOptions({
  queryKey: ["exercises"],
  queryFn: () => listExercises(),
});

export const Route = createFileRoute("/_authenticated/areas/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(exercisesQO),
  head: () => ({
    meta: [
      { title: "אזורי אימון — אימון אישי" },
      { name: "description", content: "בחר אזור אימון בחדר הכושר — חזה, גב, רגליים, כתפיים, ידיים ובטן — וצפה במכשירים הזמינים בכל אזור." },
      { property: "og:title", content: "אזורי אימון — אימון אישי" },
      { property: "og:description", content: "בחר אזור אימון בחדר הכושר — חזה, גב, רגליים, כתפיים, ידיים ובטן — וצפה במכשירים הזמינים בכל אזור." },
      { property: "og:url", content: "https://mygym-sparta.lovable.app/areas" },
      { name: "twitter:title", content: "אזורי אימון — אימון אישי" },
      { name: "twitter:description", content: "בחר אזור אימון בחדר הכושר — חזה, גב, רגליים, כתפיים, ידיים ובטן — וצפה במכשירים הזמינים בכל אזור." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://mygym-sparta.lovable.app/areas" }],
  }),
  component: AreasPage,
});

function AreasPage() {
  const { data: exercises } = useSuspenseQuery(exercisesQO);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata as { full_name?: string } | undefined;
      setName(meta?.full_name || data.user?.email?.split("@")[0] || "");
    });
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const totalMachines = exercises.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Dumbbell className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold leading-tight sm:text-lg">
                שלום{name ? `, ${name}` : ""} 👋
              </div>
              <div className="text-xs text-muted-foreground">
                {totalMachines} מכשירים זמינים
              </div>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={signOut}
            title="התנתק"
            aria-label="התנתק מהחשבון"
            className="shrink-0"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="sr-only">אזורי אימון</h1>
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">בחר אזור אימון</h2>
          <span className="text-xs text-muted-foreground">
            {AREAS.length} אזורים
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {AREAS.map((area) => {
            const count = exercises.filter((e) => e.area === area.id).length;
            return (
              <Link
                key={area.id}
                to="/areas/$areaId"
                params={{ areaId: area.id }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98] sm:p-5"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/5 transition-all group-hover:bg-primary/10" />
                <div className="relative">
                  <div className="text-3xl sm:text-4xl">{area.emoji}</div>
                  <div className="mt-3 text-base font-bold sm:text-lg">{area.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {count === 0 ? "אין מכשירים" : `${count} מכשירים`}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
