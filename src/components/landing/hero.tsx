import * as React from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, Check, Clock, MapPin } from "lucide-react";
import { SPRING } from "@/components/landing/motion";
import { GYM, SHOW_PLACEHOLDER_TAGS } from "@/components/landing/content";
import { REST_SECONDS } from "@/lib/workout.constants";
import heroImage from "@/assets/sparta-hero.jpg";

const rise = (i: number) => ({ "--rise-i": i }) as React.CSSProperties;

/**
 * Two-sided hero: copy on the start (right) side, framed image on the end
 * side with floating info cards for depth. On mobile the copy comes first.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 lg:flex lg:min-h-[92svh] lg:items-center lg:pb-24"
    >
      {/* depth: warm glow + faint grid */}
      <div
        aria-hidden
        className="absolute -z-10 start-[-10%] top-[-10%] size-[42rem] rounded-full bg-primary/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
        <div>
          <h1>
            <span
              className="landing-rise mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm font-normal text-foreground/80"
              style={rise(0)}
            >
              <span className="size-1.5 rounded-full bg-primary" />
              מכון כושר {GYM.name} · {GYM.location}
            </span>
            <span className="landing-rise landing-display block" style={rise(1)}>
              הכוח שלך
              <br />
              <span className="text-primary">מתחיל כאן.</span>
            </span>
          </h1>

          <div className="landing-rise" style={rise(2)}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-foreground/70 sm:text-xl">
              ציוד כוח לכל קבוצת שריר, שעות לגברים ולנשים, ואפליקציה שמנהלת לך את הסטים והמנוחה —
              ישר מהנייד.
            </p>
          </div>

          <div className="landing-rise mt-9 flex flex-wrap items-center gap-3" style={rise(3)}>
            <motion.div
              whileHover={reduce ? undefined : { y: -3 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
            >
              <Link
                to="/auth"
                className="inline-flex h-14 items-center gap-3 rounded-full bg-white ps-7 pe-2 text-base font-bold text-black"
              >
                התחילו להתאמן
                <span className="grid size-10 place-items-center rounded-full bg-black text-white">
                  <ArrowLeft className="size-4" />
                </span>
              </Link>
            </motion.div>
            <a
              href="#app"
              className="inline-flex h-14 items-center rounded-full border border-border px-6 font-semibold text-foreground/85 transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              איך זה עובד
            </a>
          </div>

          <div
            className="landing-rise mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-foreground/60"
            style={rise(4)}
          >
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {GYM.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              {GYM.hours[0].days} <bdi>{GYM.hours[0].time}</bdi>
            </span>
          </div>
        </div>

        <div
          className="landing-rise relative mx-auto w-full max-w-md lg:max-w-none"
          style={rise(3)}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-card">
            <motion.img
              src={heroImage}
              alt="אולם האימונים במכון ספרטא"
              width={1920}
              height={1080}
              fetchPriority="high"
              style={{ y: reduce ? undefined : imageY }}
              className="absolute inset-0 h-[112%] w-full scale-105 object-cover object-center"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"
            />
            {SHOW_PLACEHOLDER_TAGS && (
              <span className="absolute top-4 start-4 rounded-full border border-dashed border-yellow-400/70 bg-black/60 px-3 py-1 text-xs text-yellow-300">
                תמונה זמנית
              </span>
            )}
          </div>

          {/* floating cards — kept clear of the CTA and of faces */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.6 }}
            className="absolute -start-3 bottom-8 w-56 rounded-2xl border border-border bg-card/90 p-4 shadow-2xl backdrop-blur sm:-start-8"
          >
            <div className="text-xs font-semibold text-foreground/50">באפליקציה</div>
            <div className="mt-1 flex items-center gap-2 font-bold">
              <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3.5" />
              </span>
              סיימתי סט
            </div>
            <div className="mt-2 text-sm text-foreground/60">
              טיימר מנוחה של <bdi>{REST_SECONDS}</bdi> שניות מתחיל אוטומטית
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.75 }}
            className="absolute -end-2 top-8 rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-2xl backdrop-blur sm:-end-6"
          >
            <div className="text-xs font-semibold text-foreground/50">שעות פתיחה</div>
            {GYM.hours.map((h) => (
              <div key={h.days} className="mt-1 flex justify-between gap-4 text-sm font-bold">
                <span>{h.days}</span>
                <bdi className="tabular-nums">{h.time}</bdi>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
