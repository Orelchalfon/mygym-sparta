import { Clock, MapPin, Users, LayoutGrid } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/landing/motion";
import { SectionHeading } from "@/components/landing/section-heading";
import { GYM, SHOW_PLACEHOLDER_TAGS } from "@/components/landing/content";
import { AREAS } from "@/lib/workout.constants";
import heroImage from "@/assets/sparta-hero.jpg";

/**
 * Real gym photo next to verifiable facts. Deliberately no member counts,
 * ratings or "years" — add those only once the owner confirms them.
 */
export function GymProof() {
  const facts = [
    { icon: MapPin, label: "מיקום", value: GYM.location },
    {
      icon: Clock,
      label: "שעות פתיחה",
      value: GYM.hours.map((h) => (
        <span key={h.days} className="block">
          {h.days} <bdi className="tabular-nums">{h.time}</bdi>
        </span>
      )),
    },
    { icon: Users, label: "למי", value: "גברים ונשים, מכל רמה" },
    { icon: LayoutGrid, label: "באפליקציה", value: `${AREAS.length} אזורי אימון לפי קבוצת שריר` },
  ];

  return (
    <section id="gym" className="scroll-mt-24 border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-32">
        <Reveal className="relative order-last lg:order-first">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-border">
            <img
              src={heroImage}
              alt="אזור הכוח במכון ספרטא"
              loading="lazy"
              width={1920}
              height={1080}
              className="size-full object-cover"
            />
            {SHOW_PLACEHOLDER_TAGS && (
              <span className="absolute top-4 start-4 rounded-full border border-dashed border-yellow-400/70 bg-black/60 px-3 py-1 text-xs text-yellow-300">
                תמונה זמנית
              </span>
            )}
          </div>
        </Reveal>

        <div>
          <SectionHeading
            eyebrow="המכון"
            title={
              <>
                מכון אמיתי.
                <br />
                <span className="text-primary">אימון אמיתי.</span>
              </>
            }
            lead="ספרטא ממוקם בלב אבני חפץ ומציע סביבת אימון מקצועית לכל רמה — בין אם אתם ותיקים או רק מתחילים."
          />
          <StaggerGroup className="mt-10 grid gap-3 sm:grid-cols-2">
            {facts.map(({ icon: Icon, label, value }) => (
              <StaggerItem
                key={label}
                className="rounded-2xl border border-border bg-background/60 p-5"
              >
                <Icon className="size-5 text-primary" />
                <div className="mt-3 text-sm text-foreground/50">{label}</div>
                <div className="mt-1 font-bold">{value}</div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
