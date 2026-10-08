import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { listExercises } from "@/lib/workout.functions";
import { AREAS } from "@/lib/workout.constants";
import { areaCover } from "@/lib/machines";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Dumbbell, ChevronLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppHeader } from "@/components/app-header";
import { MachineImage } from "@/components/machine-image";
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
      {
        name: "description",
        content:
          "בחר אזור אימון בחדר הכושר — חזה, גב, רגליים, כתפיים, ידיים ובטן — וצפה במכשירים הזמינים בכל אזור.",
      },
      { property: "og:title", content: "אזורי אימון — אימון אישי" },
      {
        property: "og:description",
        content:
          "בחר אזור אימון בחדר הכושר — חזה, גב, רגליים, כתפיים, ידיים ובטן — וצפה במכשירים הזמינים בכל אזור.",
      },
      { property: "og:url", content: "https://mygym-sparta.lovable.app/areas" },
      { name: "twitter:title", content: "אזורי אימון — אימון אישי" },
      {
        name: "twitter:description",
        content:
          "בחר אזור אימון בחדר הכושר — חזה, גב, רגליים, כתפיים, ידיים ובטן — וצפה במכשירים הזמינים בכל אזור.",
      },
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

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AppHeader
        leading={
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="size-5" aria-hidden />
          </div>
        }
        eyebrow={name ? `שלום, ${name}` : "שלום"}
        title="אזורי אימון"
        actions={
          <>
            <ThemeToggle />
            <Button
              size="icon-touch"
              variant="ghost"
              onClick={signOut}
              aria-label="התנתק מהחשבון"
              title="התנתק"
            >
              <LogOut className="size-5" />
            </Button>
          </>
        }
      />

      <main className="mx-auto max-w-5xl px-4 pt-5 pb-8 sm:px-6 sm:pt-8">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">מה מאמנים היום?</h2>
          <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
            {exercises.length} מכשירים
          </span>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {AREAS.map((area, i) => {
            const count = exercises.filter((e) => e.area === area.id).length;
            return (
              <li
                key={area.id}
                className="animate-in fade-in slide-in-from-bottom-2 [animation-duration:300ms] [animation-fill-mode:both]"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  to="/areas/$areaId"
                  params={{ areaId: area.id }}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[transform,box-shadow] duration-200 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <MachineImage
                    machine={areaCover(area.id)}
                    className="absolute inset-0"
                    imgClassName="transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-black/0"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-black text-white sm:text-xl">
                        {area.name}
                      </div>
                      <div className="mt-0.5 text-sm text-white/80 tabular-nums">
                        {count === 0
                          ? "אין מכשירים"
                          : count === 1
                            ? "מכשיר אחד"
                            : `${count} מכשירים`}
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors group-hover:bg-primary"
                    >
                      <ChevronLeft className="size-4" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
