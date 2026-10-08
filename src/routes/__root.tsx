import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-8xl font-black tabular-nums text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">העמוד לא נמצא</h1>
        <p className="mt-2 text-muted-foreground">העמוד שחיפשת לא קיים או שהועבר למקום אחר.</p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground">העמוד לא נטען</h1>
        <p className="mt-2 text-muted-foreground">
          משהו השתבש אצלנו. אפשר לנסות שוב או לחזור לדף הבית.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            נסה שוב
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-input bg-background px-6 font-bold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            לדף הבית
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "מכון כושר ספרטא — אבני חפץ, שומרון | אימונים לגברים ולנשים" },
      {
        name: "description",
        content:
          "מכון כושר ספרטא באבני חפץ — מכון כושר מוביל בשומרון לגברים ולנשים. ציוד מתקדם, אווירה מקצועית ושעות גמישות.",
      },
      {
        name: "keywords",
        content:
          "מכון כושר, מכון כושר לגברים, מכון כושר לנשים, מכון כושר בשומרון, מכון כושר אבני חפץ, ספרטא, חדר כושר",
      },
      { property: "og:site_name", content: "מכון כושר ספרטא" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "BS_8vIW5WTAKGsyq2aJ1wucHU0QS-x1nQUhD9pne720" },
      { name: "theme-color", content: "#0a0a0a", media: "(prefers-color-scheme: dark)" },
      { name: "theme-color", content: "#faf7f5", media: "(prefers-color-scheme: light)" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Sparta Gym" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/favicon.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('app-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d)r.classList.add('dark');r.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <Outlet />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
