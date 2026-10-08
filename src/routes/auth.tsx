import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthSwitch, type AuthMode } from "@/components/auth/auth-switch";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "כניסה / הרשמה — אימון אישי" },
      {
        name: "description",
        content:
          "התחבר או הירשם לאימון אישי כדי לעקוב אחרי משקלים, חזרות וסטים בכל אימון בחדר הכושר.",
      },
      { property: "og:title", content: "כניסה / הרשמה — אימון אישי" },
      {
        property: "og:description",
        content:
          "התחבר או הירשם לאימון אישי כדי לעקוב אחרי משקלים, חזרות וסטים בכל אימון בחדר הכושר.",
      },
      { property: "og:url", content: "https://mygym-sparta.lovable.app/auth" },
      { name: "twitter:title", content: "כניסה / הרשמה — אימון אישי" },
      {
        name: "twitter:description",
        content:
          "התחבר או הירשם לאימון אישי כדי לעקוב אחרי משקלים, חזרות וסטים בכל אימון בחדר הכושר.",
      },
    ],
    links: [{ rel: "canonical", href: "https://mygym-sparta.lovable.app/auth" }],
  }),
  validateSearch: (search: Record<string, unknown>): { mode?: AuthMode } =>
    search.mode === "signup" ? { mode: "signup" } : {},
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { mode = "signin" } = Route.useSearch();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/areas", replace: true });
    });
  }, [navigate]);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-clip bg-background px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      {/* background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 right-10 size-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative flex w-full justify-center">
        <AuthSwitch
          mode={mode}
          onModeChange={(next) =>
            navigate({
              to: "/auth",
              search: next === "signup" ? { mode: "signup" } : {},
              replace: true,
              resetScroll: false,
            })
          }
        />
      </div>
    </main>
  );
}
