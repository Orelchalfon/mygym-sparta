import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Dumbbell, LogIn, Timer, UserPlus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { MACHINES } from "@/lib/machines";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/sparta-hero.jpg";

export type AuthMode = "signin" | "signup";

/*
 * Double-slider auth card (after the classic "double slider sign in/up" technique).
 *
 * Desktop (md+): a two-column card. Both forms stack in the start column; the branded
 * overlay covers the end column. Switching to sign-up slides the overlay across to the
 * start column while both forms slide to the end column, so the overlay passes over —
 * and hides — the form swap. The overlay's inner strip is twice as wide and counter-
 * slides by half, swapping which copy panel shows through the overlay's window.
 *
 * Direction: every horizontal move is multiplied by --auth-dir (1 in LTR, -1 in RTL),
 * so RTL starts with the form on the right / panel on the left and mirrors each move.
 *
 * Mobile: no overlay; only the active form renders, entering with a short fade+slide,
 * and a compact switch row sits under it.
 *
 * All motion is CSS transitions on `translate`/`opacity` (Tailwind v4 translate-x-*
 * sets the `translate` property). Transitions retarget from their current value, so
 * rapid toggling never strands the card mid-state. The global prefers-reduced-motion
 * rule in styles.css zeroes durations and delays, which removes the slide entirely.
 */

// Forms slide for 600ms. The outgoing form fades out over the first half (while the
// overlay covers it); the incoming one fades in over the second half.
const PANE_OUT = "[transition:translate_600ms_ease-in-out,opacity_300ms_ease-in-out]";
const PANE_IN = "[transition:translate_600ms_ease-in-out,opacity_300ms_ease-in-out_300ms]";
const SLIDE = "[transition:translate_600ms_ease-in-out]";

interface AuthSwitchProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthSwitch({ mode, onModeChange }: AuthSwitchProps) {
  const isSignUp = mode === "signup";
  // Email is the only value carried across modes; passwords stay per-form, in memory.
  const [email, setEmail] = useState("");
  const signInFirstField = useRef<HTMLInputElement | null>(null);
  const signUpFirstField = useRef<HTMLInputElement | null>(null);

  // Move focus into the newly active form after a user-initiated switch (never on
  // first mount). The previous focus target — the switch button — has just become
  // inert, so without this focus would fall back to <body>.
  const previousMode = useRef(mode);
  useEffect(() => {
    if (previousMode.current === mode) return;
    previousMode.current = mode;
    const target = mode === "signup" ? signUpFirstField.current : signInFirstField.current;
    target?.focus({ preventScroll: true });
  }, [mode]);

  const paneClass = (active: boolean) =>
    cn(
      "px-6 py-10 sm:px-10 md:col-start-1 md:row-start-1 md:flex md:flex-col md:justify-center md:px-12 md:py-12",
      active
        ? cn(
            "relative z-20 opacity-100",
            PANE_IN,
            "max-md:animate-in max-md:fade-in max-md:slide-in-from-bottom-2 max-md:[animation-duration:250ms]",
          )
        : cn("pointer-events-none relative z-10 opacity-0 max-md:hidden", PANE_OUT),
      isSignUp && "md:translate-x-[calc(var(--auth-dir)*100%)]",
    );

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-6">
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

      <div className="relative w-full overflow-clip rounded-3xl border bg-card shadow-2xl [--auth-dir:1] rtl:[--auth-dir:-1] md:grid md:min-h-[600px] md:grid-cols-2">
        <div className={paneClass(!isSignUp)} inert={isSignUp}>
          <SignInForm email={email} onEmailChange={setEmail} firstFieldRef={signInFirstField} />
        </div>
        <div className={paneClass(isSignUp)} inert={!isSignUp}>
          <SignUpForm
            email={email}
            onEmailChange={setEmail}
            onBackToSignIn={() => onModeChange("signin")}
            firstFieldRef={signUpFirstField}
          />
        </div>

        {/* Branded overlay (desktop only): a window onto a double-width strip. */}
        <div
          className={cn(
            "absolute inset-y-0 start-1/2 z-30 hidden w-1/2 overflow-hidden md:block",
            SLIDE,
            isSignUp && "translate-x-[calc(var(--auth-dir)*-100%)]",
          )}
        >
          <div
            className={cn(
              "relative -start-full flex h-full w-[200%] bg-neutral-950 text-white",
              SLIDE,
              isSignUp && "translate-x-[calc(var(--auth-dir)*50%)]",
            )}
          >
            <OverlayDecor />
            {/* Start half: shown while signing up — invites returning members back. */}
            <OverlayPanel
              inert={!isSignUp}
              className={cn(SLIDE, !isSignUp && "translate-x-[calc(var(--auth-dir)*-20%)]")}
              icon={LogIn}
              title="ברוכים השבים!"
              body="כבר יש לכם חשבון? התחברו והמשיכו מהסט שבו עצרתם."
              actionLabel="התחברות"
              onAction={() => onModeChange("signin")}
              preview={<RestPreview />}
            />
            {/* End half: shown while signing in — invites new members to sign up. */}
            <OverlayPanel
              inert={isSignUp}
              className={cn(SLIDE, isSignUp && "translate-x-[calc(var(--auth-dir)*20%)]")}
              icon={UserPlus}
              title="חדשים בספרטא?"
              body="פתחו חשבון ועקבו אחרי משקלים, סטים ומנוחה בכל מכשיר במכון."
              actionLabel="הרשמה"
              onAction={() => onModeChange("signup")}
              preview={<SetPreview />}
            />
          </div>
        </div>

        {/* Mobile: compact switch row replaces the sliding overlay. */}
        <div className="flex flex-wrap items-center justify-center gap-x-1 border-t px-6 py-3 text-sm text-muted-foreground md:hidden">
          <span>{isSignUp ? "כבר יש לכם חשבון?" : "אין לכם חשבון?"}</span>
          <Button
            type="button"
            variant="link"
            className="h-11 px-2 font-semibold"
            onClick={() => onModeChange(isSignUp ? "signin" : "signup")}
          >
            {isSignUp ? <LogIn aria-hidden /> : <UserPlus aria-hidden />}
            {isSignUp ? "התחברות" : "הרשמה"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface OverlayPanelProps {
  inert: boolean;
  className?: string;
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  preview: ReactNode;
}

function OverlayPanel({
  inert,
  className,
  icon: Icon,
  title,
  body,
  actionLabel,
  onAction,
  preview,
}: OverlayPanelProps) {
  return (
    <div
      inert={inert}
      className={cn(
        "relative z-10 flex w-1/2 flex-col items-center justify-center gap-5 px-12 text-center",
        className,
      )}
    >
      <h2 className="text-4xl font-black tracking-tight">{title}</h2>
      <p className="max-w-xs text-base leading-relaxed text-white/85">{body}</p>
      {preview}
      <Button
        type="button"
        variant="outline"
        size="touch"
        onClick={onAction}
        className="min-w-40 rounded-full border-white/70 bg-transparent px-8 font-bold text-white shadow-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
      >
        <Icon aria-hidden />
        {actionLabel}
      </Button>
    </div>
  );
}

/** Gym photo under a dark→red wash, painted on the moving strip (purely decorative). */
function OverlayDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src={heroImage}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-linear-to-br from-black/85 via-[#7f1418]/75 to-black/90" />
      <div className="absolute -bottom-24 start-1/4 size-80 rounded-full bg-[#e4494f]/30 blur-3xl" />
      <div className="absolute -top-24 end-1/4 size-72 rounded-full bg-[#e4494f]/20 blur-3xl" />
    </div>
  );
}

const glassCard =
  "w-full max-w-xs rounded-2xl border border-white/20 bg-white/10 p-4 text-start shadow-lg backdrop-blur-md";

/** Illustrative product preview (not a testimonial): an active set on a machine. */
function SetPreview() {
  const machine = MACHINES.get(12);
  return (
    <div aria-hidden className={cn(glassCard, "flex items-center gap-3")}>
      {machine && (
        <img
          src={machine.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-14 shrink-0 rounded-xl object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold">מכשיר 12 · {machine?.nameHe}</div>
        <div className="mt-1 text-xs text-white/75 tabular-nums">סט 2 מתוך 3</div>
        <div className="mt-2 flex gap-1.5">
          <span className="grid size-6 place-items-center rounded-full bg-white/25">
            <Check className="size-3.5" />
          </span>
          <span className="grid size-6 place-items-center rounded-full bg-[#e4494f] text-xs font-bold">
            2
          </span>
          <span className="grid size-6 place-items-center rounded-full bg-white/10 text-xs">3</span>
        </div>
      </div>
      <div className="text-end">
        <div className="text-2xl font-black tabular-nums">35</div>
        <div className="text-xs text-white/75">ק״ג</div>
      </div>
    </div>
  );
}

/** Illustrative product preview: the automatic rest timer between sets. */
function RestPreview() {
  return (
    <div aria-hidden className={glassCard}>
      <div className="flex items-center justify-between gap-2 text-sm font-bold">
        <span className="flex items-center gap-2">
          <Timer className="size-4 shrink-0" />
          מנוחה בין סטים
        </span>
        <span className="tabular-nums">0:30</span>
      </div>
      {/* Width-based bar fills from the inline start (RTL-safe). */}
      <div className="mt-3 h-2 rounded-full bg-white/20">
        <div className="h-full w-1/3 rounded-full bg-[#e4494f]" />
      </div>
      <p className="mt-2 text-xs text-white/75">הסט הבא: 3 מתוך 3</p>
    </div>
  );
}
