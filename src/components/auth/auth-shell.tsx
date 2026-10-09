import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/sparta-hero.jpg";

/** The password-reset flow, shown as a stepper so users know what comes next. */
const RESET_STEPS = [
  { title: "מזינים אימייל", body: "הכתובת שאיתה נרשמתם לספרטא" },
  { title: "לוחצים על הקישור", body: "שלחנו אותו למייל, בתוקף לזמן קצר" },
  { title: "בוחרים סיסמה חדשה", body: "ונכנסים ישר לאימונים" },
] as const;

export type ResetStep = 1 | 2 | 3;

interface AuthShellProps {
  /** Current step of the reset flow (1-based). */
  step: ResetStep;
  children: ReactNode;
}

/**
 * Password-reset layout. Desktop: the form beside a branded panel with the full
 * stepper (same photo + red wash as the /auth overlay). Mobile: a compact stepper
 * above the form.
 */
export function AuthShell({ step, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-clip bg-background px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 right-10 size-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-4xl flex-col items-center gap-6">
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

        <div className="w-full max-w-md overflow-clip rounded-3xl border bg-card shadow-2xl md:grid md:min-h-[560px] md:max-w-none md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 md:px-12">
            <MobileStepper step={step} />
            <div
              key={step}
              className="animate-in fade-in slide-in-from-bottom-2 [animation-duration:250ms]"
            >
              {children}
            </div>
          </div>
          <BrandPanel step={step} />
        </div>
      </div>
    </main>
  );
}

/** Desktop only: photo panel with the full vertical stepper. */
function BrandPanel({ step }: { step: ResetStep }) {
  return (
    <div className="relative hidden overflow-hidden bg-neutral-950 text-white md:flex md:flex-col md:justify-center md:px-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img
          src={heroImage}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-br from-black/85 via-[#7f1418]/75 to-black/90" />
        <div className="absolute -bottom-24 start-1/4 size-80 rounded-full bg-[#e4494f]/30 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-8">
        <div>
          <p className="text-sm font-semibold text-white/70">איפוס סיסמה</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight">שלושה צעדים וחוזרים להתאמן</h2>
        </div>
        <ol className="flex flex-col">
          {RESET_STEPS.map((s, i) => {
            const n = (i + 1) as ResetStep;
            const state = n < step ? "done" : n === step ? "current" : "upcoming";
            return (
              <li
                key={s.title}
                aria-current={state === "current" ? "step" : undefined}
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                {/* Connector to the next step; filled once this step is done. */}
                {i < RESET_STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute start-[17px] top-10 bottom-1 w-0.5 rounded-full transition-colors duration-300",
                      state === "done" ? "bg-[#e4494f]" : "bg-white/20",
                    )}
                  />
                )}
                <StepDot n={n} state={state} />
                <div className="pt-1.5">
                  <p
                    className={cn(
                      "font-bold transition-colors duration-300",
                      state === "upcoming" ? "text-white/60" : "text-white",
                    )}
                  >
                    {s.title}
                    {state === "done" && <span className="sr-only"> (הושלם)</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-white/70">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function StepDot({ n, state }: { n: number; state: "done" | "current" | "upcoming" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums transition-all duration-300",
        state === "done" && "bg-[#e4494f] text-white",
        state === "current" && "bg-white text-neutral-950 ring-4 ring-[#e4494f]/50",
        state === "upcoming" && "border border-white/30 text-white/70",
      )}
    >
      {state === "done" ? <Check className="size-4" /> : n}
    </span>
  );
}

/** Mobile only: three segments + "step n of 3" label. */
function MobileStepper({ step }: { step: ResetStep }) {
  return (
    <div className="mb-8 md:hidden">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          שלב <span className="tabular-nums">{step}</span> מתוך 3
        </span>
        <span className="text-foreground">{RESET_STEPS[step - 1].title}</span>
      </div>
      <div
        className="mt-2 grid grid-cols-3 gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={step}
        aria-label="התקדמות באיפוס הסיסמה"
      >
        {RESET_STEPS.map((s, i) => (
          <span
            key={s.title}
            className={cn(
              "h-1.5 rounded-full transition-colors duration-300",
              i < step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}
