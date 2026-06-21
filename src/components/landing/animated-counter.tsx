import * as React from "react";
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
} from "motion/react";

type AnimatedCounterProps = {
  to: number;
  /** Animation duration in seconds. */
  duration?: number;
  suffix?: string;
  className?: string;
};

/**
 * Counts up from 0 to `to` the first time it scrolls into view.
 * Shows the final value immediately when reduced motion is requested
 * (ui-ux-pro-max §6 number-tabular, §7 animation-optional).
 */
export function AnimatedCounter({
  to,
  duration = 1.4,
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(to);
      return;
    }
    const controls = animate(count, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration, count]);

  return (
    <span ref={ref} className={className}>
      <span className="tabular-nums">{display}</span>
      {suffix}
    </span>
  );
}
