import * as React from "react";
import { Pause, Play } from "lucide-react";
import { AREAS, REST_SECONDS } from "@/lib/workout.constants";
import { GYM } from "@/components/landing/content";

/** Factual benefits only — no invented statistics (plan §5). */
const BENEFITS = [
  "ציוד כוח לכל קבוצת שריר",
  "אימונים לגברים ולנשים",
  `${AREAS.length} אזורי אימון באפליקציה`,
  "תיעוד סטים מהנייד",
  `טיימר מנוחה של ${REST_SECONDS} שניות`,
  "משקולות חופשיות ומתלי סקוואט",
  GYM.location,
];

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center" dir="rtl">
      {BENEFITS.map((b) => (
        <li key={b} className="flex items-center whitespace-nowrap">
          <span className="px-6 text-lg font-bold uppercase tracking-tight text-foreground/85 sm:px-8 sm:text-2xl">
            {b}
          </span>
          <span aria-hidden className="text-xl text-primary">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Infinite horizontal ticker. The track is LTR so translateX(-50%) loops two
 * identical rows seamlessly; items stay RTL. Pausable (WCAG 2.2.2) and static
 * under prefers-reduced-motion (handled in styles.css).
 */
export function BenefitsTicker() {
  const [paused, setPaused] = React.useState(false);
  return (
    <section aria-label="היתרונות שלנו" className="relative border-y border-border bg-card/60 py-5">
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div dir="ltr" data-paused={paused} className="landing-marquee flex w-max">
          <Row />
          <Row hidden />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "הפעלת התנועה" : "עצירת התנועה"}
        className="absolute end-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 text-foreground/70 hover:text-foreground motion-reduce:hidden"
      >
        {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
      </button>
    </section>
  );
}
