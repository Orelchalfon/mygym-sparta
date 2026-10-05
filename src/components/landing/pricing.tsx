import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/landing/motion";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn } from "@/lib/utils";

/**
 * Proposed digital plans (plan §6). Not yet approved for sale — rendered only
 * when SHOW_PRICING is on. Prices here are display copy; the server is the
 * source of truth once billing exists.
 */
const PLANS = [
  {
    name: "בסיס",
    price: "חינם",
    period: null,
    note: "לכל מתאמני המכון",
    features: [
      "קטלוג מכשירים לפי אזור",
      "תיעוד אימונים וסטים",
      "טיימר מנוחה והיסטוריה",
      "10 סריקות מזון AI ראשונות",
    ],
    cta: "התחילו בחינם",
    featured: false,
  },
  {
    name: "מנוי דיגיטלי",
    price: "39 ₪",
    period: "לחודש",
    note: "בשני החודשים הראשונים, ואחר כך 79 ₪ לחודש",
    features: [
      "כל מה שבבסיס",
      "סריקות מזון לפי מכסה חודשית",
      "בניית תוכנית אימון",
      "לוח אימונים חודשי",
    ],
    cta: "להצטרפות",
    featured: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="מסלולים"
          title={
            <>
              בחרו את <span className="text-primary">המסלול.</span>
            </>
          }
        />
        <span className="rounded-full border border-dashed border-yellow-400/70 px-3 py-1 text-xs text-yellow-300">
          Preview — מחירים ותכולה ממתינים לאישור
        </span>
      </div>

      <StaggerGroup className="mt-14 grid gap-4 md:grid-cols-2">
        {PLANS.map((plan) => (
          <StaggerItem
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-[1.75rem] border p-8 sm:p-10",
              plan.featured
                ? "border-primary/50 bg-gradient-to-b from-primary/15 to-card"
                : "border-border bg-card",
            )}
          >
            {plan.featured && (
              <span className="absolute -top-3 start-8 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                הכי משתלם
              </span>
            )}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div className="mt-6 flex items-baseline gap-2">
              <bdi className="text-6xl font-black tabular-nums">{plan.price}</bdi>
              {plan.period && <span className="text-foreground/60">{plan.period}</span>}
            </div>
            <p className="mt-2 text-sm text-foreground/60">{plan.note}</p>
            <ul className="mt-8 space-y-3 border-t border-border pt-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-primary" />
                  <span className="text-foreground/85">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className={cn(
                "mt-10 flex h-13 items-center justify-center rounded-full py-3.5 font-bold",
                plan.featured
                  ? "bg-white text-black"
                  : "border border-border hover:border-foreground/40",
              )}
            >
              {plan.cta}
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <p className="mt-6 text-center text-sm text-foreground/50">
        המנוי הדיגיטלי נפרד מדמי המנוי למכון ואינו מעניק כניסה למכון. ניתן לבטל בכל עת.
      </p>
    </section>
  );
}
