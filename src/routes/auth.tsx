import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthSwitch, type AuthMode } from "@/components/auth/auth-switch";
import { SITE_URL } from "@/lib/site";
import { DEFAULT_AFTER_AUTH, safeRedirect } from "@/lib/auth-redirect";

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
      { property: "og:url", content: `${SITE_URL}/auth` },
      { name: "twitter:title", content: "כניסה / הרשמה — אימון אישי" },
      {
        name: "twitter:description",
        content:
          "התחבר או הירשם לאימון אישי כדי לעקוב אחרי משקלים, חזרות וסטים בכל אימון בחדר הכושר.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/auth` }],
  }),
  // Keys must be set even when rejected: the router merges raw params under the
  // validated ones, so an omitted key would let the unchecked value through.
  validateSearch: (search: Record<string, unknown>): { mode?: AuthMode; redirect?: string } => ({
    mode: search.mode === "signup" ? "signup" : undefined,
    redirect: safeRedirect(search.redirect),
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { mode = "signin", redirect } = Route.useSearch();
  const target = safeRedirect(redirect) ?? DEFAULT_AFTER_AUTH;

  useEffect(() => {
    // Also the landing page for email-confirmation links: once the client has read
    // the session from the URL, this forwards the user to where they were headed.
    try {
      supabase.auth
        .getUser()
        .then(({ data }) => {
          if (data.user) {
            navigate({ href: target, replace: true });
          }
        })
        .catch(() => {
          // Keep the sign-in form visible if the auth check fails.
        });
    } catch {
      // Keep the sign-in form visible if auth initialization fails.
    }
  }, [navigate, target]);

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
          redirectTo={target}
          onModeChange={(next) =>
            navigate({
              to: "/auth",
              // Keep the return target across sign-in/sign-up switches.
              search: { ...(next === "signup" ? { mode: "signup" } : {}), redirect },
              replace: true,
              resetScroll: false,
            })
          }
        />
      </div>
    </main>
  );
}
