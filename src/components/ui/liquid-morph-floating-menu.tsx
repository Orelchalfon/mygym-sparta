import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";

/**
 * Liquid-morph floating menu (adapted from 21st.dev): a pill docked at the bottom
 * that morphs into a panel. Liquid-glass surface with brand-red ink (see `.liquid-glass`
 * in styles.css); the hamburger is the landing header's MenuToggleIcon.
 */

const ease = [0.22, 1, 0.36, 1] as const;
const BAR_HEIGHT = 56;
const CLOSED_WIDTH = 264;
const OPEN_WIDTH = 320;
const GUTTER = 32;

interface FloatingMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Content shown after the hamburger while the menu is closed. */
  bar?: React.ReactNode;
  /** Expanded panel content. */
  children: React.ReactNode;
  className?: string;
  /** Accessible name of the panel region. */
  label?: string;
}

function useViewportWidth() {
  const [width, setWidth] = React.useState(() =>
    typeof window === "undefined" ? 390 : window.innerWidth,
  );
  React.useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

export function FloatingMenu({
  open,
  onOpenChange,
  bar,
  children,
  className,
  label = "תפריט",
}: FloatingMenuProps) {
  const reduce = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const panelId = React.useId();
  const viewport = useViewportWidth();
  const [panelHeight, setPanelHeight] = React.useState(0);

  const closedWidth = Math.min(CLOSED_WIDTH, viewport - GUTTER);
  const openWidth = Math.min(OPEN_WIDTH, viewport - GUTTER);

  // Size the open state to its content rather than a fixed height.
  React.useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const measure = () => setPanelHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Close on outside tap/click and on Escape (focus returns to the toggle).
  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onOpenChange(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const morph = reduce ? { duration: 0 } : { duration: 0.7, ease };

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex justify-center",
        className,
      )}
    >
      <motion.div
        className="pointer-events-auto relative overflow-hidden"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          width: open ? openWidth : closedWidth,
          height: open ? panelHeight + BAR_HEIGHT : BAR_HEIGHT,
          borderRadius: open ? 32 : 28,
        }}
        transition={{
          ...morph,
          opacity: { duration: 0.3 },
          y: { duration: 0.4, ease },
          height: reduce ? { duration: 0 } : { duration: open ? 0.7 : 0.25, ease },
        }}
      >
        {/* Shell */}
        <div className="liquid-glass absolute inset-0 rounded-[inherit]" />

        {/* Panel — laid out at the open width so its height can be measured up front */}
        <div
          id={panelId}
          role="region"
          aria-label={label}
          inert={!open}
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 text-glass-ink transition-opacity",
            open ? "opacity-100 duration-300" : "opacity-0 duration-100",
          )}
          style={{ width: openWidth }}
        >
          <div ref={panelRef}>{children}</div>
        </div>

        {/* Bottom bar: hamburger first (start side in RTL), then the closed-state content */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center gap-1 ps-1.5 pe-2"
          style={{ height: BAR_HEIGHT }}
        >
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => onOpenChange(!open)}
            className={cn(
              "relative grid size-11 shrink-0 place-items-center rounded-full text-glass-ink transition-colors hover:bg-glass-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <MenuToggleIcon open={open} className="size-6" duration={reduce ? 0 : 500} />
          </button>
          <div
            inert={open}
            className={cn(
              "flex min-w-0 flex-1 items-center transition-opacity",
              open ? "opacity-0 duration-100" : "opacity-100 delay-200 duration-300",
            )}
          >
            {bar}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** Fades a panel row in, staggered after the morph settles. */
export function FloatingMenuItem({
  open,
  index,
  className,
  children,
}: {
  open: boolean;
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: open ? 1 : 0, y: open || reduce ? 0 : 8 }}
      transition={{
        duration: reduce ? 0.15 : 0.4,
        delay: open && !reduce ? 0.3 + 0.06 * index : 0,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The menu's letter-roll hover: each glyph slides up to a duplicate, staggered.
 * Place inside an element with the `group` class; runs on hover-capable pointers
 * and keyboard focus, and not at all with reduced motion.
 */
export function RollingText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("inline-flex", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex">
        {Array.from(text).map((char, i) => (
          <span key={i} className="inline-block h-[1.25em] overflow-hidden leading-[1.25em]">
            <span
              className="flex flex-col transition-transform duration-0 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1/2 group-hover:duration-700 group-hover:[transition-delay:var(--d)] group-focus-visible:-translate-y-1/2 group-focus-visible:duration-700 group-focus-visible:[transition-delay:var(--d)] motion-reduce:!translate-y-0"
              style={{ "--d": `${30 * i}ms` } as React.CSSProperties}
            >
              <span className="block h-[1.25em]">{char === " " ? " " : char}</span>
              <span className="block h-[1.25em]">{char === " " ? " " : char}</span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
