import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";

/** Single-card auth layout (password reset screens); matches the /auth page chrome. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-clip bg-background px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 right-10 size-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-md flex-col items-center gap-6">
        <Link
          to="/"
          aria-label="ספרטא — חזרה לדף הבית"
          className="flex min-h-11 items-center gap-2 rounded-lg px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Dumbbell className="size-5" aria-hidden />
          </span>
          <span className="text-xl font-black tracking-tight text-foreground">ספרטא</span>
        </Link>
        <div className="w-full rounded-3xl border bg-card px-6 py-10 shadow-2xl sm:px-10">
          {children}
        </div>
      </div>
    </main>
  );
}
