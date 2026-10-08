import type { ReactNode } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: ReactNode;
  /** Small line above the title (e.g. "אזור אימון"). */
  eyebrow?: ReactNode;
  /** Leading visual when there's no back link (e.g. brand mark). */
  leading?: ReactNode;
  /** Back target; renders a 44px back button on the start side. */
  back?: { to: LinkProps["to"]; params?: LinkProps["params"]; label: string };
  actions?: ReactNode;
  className?: string;
}

/**
 * Shared sticky header for the signed-in app. Same placement on every screen,
 * clears the iOS notch (viewport-fit=cover), and keeps actions visible on mobile.
 */
export function AppHeader({ title, eyebrow, leading, back, actions, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
        {back ? (
          <Link
            to={back.to}
            params={back.params as never}
            aria-label={back.label}
            className="-ms-1 grid size-11 shrink-0 place-items-center rounded-xl text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        ) : (
          leading
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && <div className="truncate text-xs text-muted-foreground">{eyebrow}</div>}
          <h1 className="truncate text-lg font-bold leading-tight sm:text-xl">{title}</h1>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
