import * as React from "react";
import { Check, Dumbbell, Play, X, Repeat } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { AREAS, REST_SECONDS } from "@/lib/workout.constants";
import { SPRING } from "@/components/landing/motion";

const R = 45;
const CIRC = 2 * Math.PI * R;

/**
 * Self-driving demo of the live rest timer. Loops REST_SECONDS → 0 → reset.
 * Freezes on a static frame under prefers-reduced-motion (§7 reduced-motion).
 */
function useDemoTimer() {
  const reduce = useReducedMotion();
  const [seconds, setSeconds] = React.useState(REST_SECONDS);
  React.useEffect(() => {
    if (reduce) {
      setSeconds(REST_SECONDS);
      return;
    }
    const id = setInterval(() => {
      setSeconds((s) => (s <= 1 ? REST_SECONDS : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [reduce]);
  return seconds;
}

/** The phone screen: the rest-timer view (mirrors the real exercise route). */
function PhoneScreen() {
  const seconds = useDemoTimer();
  const pct = ((REST_SECONDS - seconds) / REST_SECONDS) * 100;
  const totalSets = 3;
  const completed = 1;

  return (
    <div
      dir="rtl"
      className="flex h-full w-full flex-col items-center gap-5 bg-background px-5 pb-6 pt-8 text-foreground"
    >
      {/* top bar */}
      <div className="flex w-full items-center justify-between">
        <div className="grid size-9 place-items-center rounded-xl text-muted-foreground">
          <X className="size-5" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
          מנוחה
        </div>
        <div className="size-9" />
      </div>

      {/* circular timer */}
      <div className="relative size-44">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-muted/40"
          />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - pct / 100)}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-black tabular-nums">{seconds}</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">שניות</div>
        </div>
      </div>

      {/* set progress dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSets }).map((_, i) => {
          const done = i < completed;
          const current = i === completed;
          return (
            <div
              key={i}
              className={`grid size-7 place-items-center rounded-full text-[11px] font-bold ${
                done
                  ? "bg-primary/20 text-primary"
                  : current
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <Check className="size-3.5" /> : <span>{i + 1}</span>}
            </div>
          );
        })}
      </div>

      {/* end-set button */}
      <div className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-lg shadow-primary/30">
        <Check className="size-4" />
        סיימתי סט
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Repeat className="size-3" />
        מנוחה אוטומטית של {REST_SECONDS} שניות
      </div>
    </div>
  );
}

/** Floating "areas" card that drifts behind the phone. */
function AreasCard() {
  return (
    <div
      dir="rtl"
      aria-hidden="true"
      className="w-44 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur"
    >
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        אזורי אימון
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {AREAS.slice(0, 6).map((a) => (
          <div
            key={a.id}
            className="flex flex-col items-center gap-0.5 rounded-lg border border-border/60 bg-background/60 py-1.5"
          >
            <span className="text-base leading-none">{a.emoji}</span>
            <span className="text-[8px] text-muted-foreground">{a.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Floating "machine" card with the big weight number (mirrors ExerciseCard). */
function MachineCard() {
  return (
    <div
      dir="rtl"
      aria-hidden="true"
      className="w-40 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur"
    >
      <div className="text-sm font-bold">מכשיר 6</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">
        3 סטים × 7 חזרות
      </div>
      <div className="my-2 flex items-baseline justify-center gap-1">
        <span className="text-4xl font-black tabular-nums text-primary">35</span>
        <span className="text-[10px] font-semibold text-muted-foreground">
          ק"ג
        </span>
      </div>
      <div className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground">
        <Play className="size-3 fill-current" />
        התחל אימון
      </div>
    </div>
  );
}

/**
 * Animated "screenshot" of the training flow — a phone frame showing the live
 * rest timer, with floating areas + machine cards drifting around it.
 * Decorative chrome is aria-hidden; the section heading carries the meaning.
 */
export function TrainingPreview() {
  const reduce = useReducedMotion();
  const float = (delay: number) =>
    reduce
      ? {}
      : {
          animate: { y: [0, -10, 0] },
          transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay,
          },
        };

  return (
    <div className="relative mx-auto flex min-h-[30rem] w-full max-w-sm items-center justify-center">
      {/* glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,theme(colors.primary/25),transparent_65%)] blur-2xl"
      />

      {/* floating areas card — top right */}
      <motion.div
        className="absolute -right-2 top-2 z-20 sm:-right-8"
        initial={{ opacity: 0, x: 20, y: -10 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ ...SPRING, delay: 0.25 }}
      >
        <motion.div {...float(0)}>
          <AreasCard />
        </motion.div>
      </motion.div>

      {/* floating machine card — bottom left */}
      <motion.div
        className="absolute -left-2 bottom-6 z-20 sm:-left-10"
        initial={{ opacity: 0, x: -20, y: 10 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ ...SPRING, delay: 0.4 }}
      >
        <motion.div {...float(1.2)}>
          <MachineCard />
        </motion.div>
      </motion.div>

      {/* phone */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ ...SPRING, delay: 0.05 }}
      >
        <div className="relative h-[34rem] w-64 rounded-[2.75rem] border-[6px] border-foreground/90 bg-foreground/90 p-1.5 shadow-2xl">
          {/* notch */}
          <div className="absolute left-1/2 top-2.5 z-30 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground/90" />
          <div className="size-full overflow-hidden rounded-[2.25rem]">
            <PhoneScreen />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
