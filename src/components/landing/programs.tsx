import { Dumbbell, HeartPulse, Smartphone, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StaggerGroup, StaggerItem, useReducedMotion } from "@/components/landing/motion";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn } from "@/lib/utils";

type Program = {
  icon: LucideIcon;
  title: string;
  body: string;
  tags: string[];
  span: string;
  featured?: boolean;
};

/**
 * Only services the gym already offers (from the existing site copy).
 * Asymmetric 60/40 grid on desktop, one column on mobile.
 */
const PROGRAMS: Program[] = [
  {
    icon: Dumbbell,
    title: "אימוני כוח",
    body: "אזור כוח מלא — משקולות חופשיות, מתלים, כבלים ומכשירים לכל קבוצת שריר. לבניית מסה, כוח וכושר.",
    tags: ["משקולות חופשיות עד 50 ק״ג", "מתלי סקוואט ובנץ׳", "כבלים רב־תכליתיים"],
    span: "lg:col-span-3",
    featured: true,
  },
  {
    icon: HeartPulse,
    title: "אירובי וגמישות",
    body: "הליכונים, אופניים ואזור מתיחות לחימום, סיבולת ושחרור בסוף האימון.",
    tags: ["הליכונים", "אופניים", "מתיחות"],
    span: "lg:col-span-2",
  },
  {
    icon: Users,
    title: "גברים ונשים",
    body: "שעות ייעודיות ואווירה נעימה ומכבדת — לכל מטרה: חיטוב, חיזוק ובריאות.",
    tags: ["שעות ייעודיות", "לכל רמה"],
    span: "lg:col-span-2",
  },
  {
    icon: Smartphone,
    title: "האפליקציה למתאמנים",
    body: "בוחרים אזור שריר, פותחים את המכשיר עם המשקל שלכם, מסמנים ״סיימתי סט״ — והמנוחה נספרת לבד.",
    tags: ["כרטיס מכשיר", "מעקב סטים", "טיימר מנוחה"],
    span: "lg:col-span-3",
  },
];

export function Programs() {
  const reduce = useReducedMotion();
  return (
    <section id="programs" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:py-32">
      <SectionHeading
        eyebrow="מה מחכה לכם"
        title={
          <>
            אימון שמתאים <span className="text-primary">לכם.</span>
          </>
        }
      />
      <StaggerGroup className="mt-14 grid gap-4 lg:grid-cols-5" stagger={0.08}>
        {PROGRAMS.map(({ icon: Icon, title, body, tags, span, featured }) => (
          <StaggerItem
            key={title}
            whileHover={reduce ? undefined : { y: -4 }}
            className={cn(
              "group flex min-h-72 flex-col rounded-[1.75rem] border p-7 transition-colors sm:p-9",
              featured
                ? "border-primary/40 bg-gradient-to-br from-primary/20 via-card to-card"
                : "border-border bg-card hover:border-foreground/20",
              span,
            )}
          >
            <span
              className={cn(
                "grid size-12 place-items-center rounded-2xl",
                featured ? "bg-primary text-primary-foreground" : "bg-white/5 text-primary",
              )}
            >
              <Icon className="size-6" />
            </span>
            <h3 className="mt-auto pt-10 text-3xl font-black">{title}</h3>
            <p className="mt-3 max-w-lg text-foreground/65">{body}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-border bg-background/50 px-3 py-1 text-sm text-foreground/75"
                >
                  {t}
                </li>
              ))}
            </ul>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
