import * as React from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";

/**
 * Shared motion tokens so every landing-page animation shares one rhythm
 * (ui-ux-pro-max §7: motion-consistency, duration-timing, easing).
 */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const ENTER_TRANSITION = { duration: 0.5, ease: EASE_OUT } as const;
export const SPRING = { type: "spring", stiffness: 120, damping: 18 } as const;

/** Standard fade + rise used by Reveal / StaggerItem. */
const riseVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: ENTER_TRANSITION },
};

const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

type DivMotionProps = HTMLMotionProps<"div">;

/**
 * Fades + slides content up the first time it scrolls into view.
 * Collapses to a quick opacity fade when the user prefers reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  ...props
}: DivMotionProps & { delay?: number }) {
  const reduce = useReducedMotion();
  const variants = reduce ? reducedVariants : riseVariants;
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={delay ? { ...ENTER_TRANSITION, delay } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Parent that staggers its StaggerItem children in sequence
 * (§7 stagger-sequence ~30–60ms). `trigger` controls whether it animates on
 * mount ("mount") or when scrolled into view ("inView").
 */
export function StaggerGroup({
  children,
  stagger = 0.06,
  delayChildren = 0,
  trigger = "inView",
  ...props
}: DivMotionProps & {
  stagger?: number;
  delayChildren?: number;
  trigger?: "mount" | "inView";
}) {
  const reduce = useReducedMotion();
  const container: Variants = {
    hidden: {},
    show: {
      transition: reduce
        ? { staggerChildren: 0 }
        : { staggerChildren: stagger, delayChildren },
    },
  };
  const triggerProps =
    trigger === "mount"
      ? { animate: "show" as const }
      : { whileInView: "show" as const, viewport: { once: true, margin: "-60px" } };
  return (
    <motion.div initial="hidden" variants={container} {...triggerProps} {...props}>
      {children}
    </motion.div>
  );
}

/** A single staggered child. Must be rendered inside a StaggerGroup. */
export function StaggerItem({ children, ...props }: DivMotionProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div variants={reduce ? reducedVariants : riseVariants} {...props}>
      {children}
    </motion.div>
  );
}

/** Re-export motion + the reduced-motion hook for ad-hoc use. */
export { motion, useReducedMotion };
export const MotionDiv = motion.div;
