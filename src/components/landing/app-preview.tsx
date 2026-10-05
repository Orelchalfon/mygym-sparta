import { Check } from "lucide-react";
import { Reveal } from "@/components/landing/motion";
import { SectionHeading } from "@/components/landing/section-heading";
import { TrainingPreview } from "@/components/landing/training-preview";

const STEPS = [
  "נכנסים מהנייד לחשבון שלכם",
  "בוחרים אזור שריר ומכשיר",
  "מכוונים משקל, סטים וחזרות",
  "לוחצים ״סיימתי סט״ — והמנוחה נספרת לבד",
];

export function AppPreview() {
  return (
    <section
      id="app"
      className="mx-auto max-w-7xl scroll-mt-24 overflow-x-clip px-4 py-24 sm:px-6 lg:py-32"
    >
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="האפליקציה למתאמנים"
            title={
              <>
                מנהלים את האימון <span className="text-primary">בלייב.</span>
              </>
            }
            lead="הכול במקום אחד, בעברית ומותאם לנייד. אפשר לפתוח בדפדפן או להתקין למסך הבית."
          />
          <Reveal delay={0.1}>
            <ol className="mt-10 space-y-3">
              {STEPS.map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 font-black text-primary tabular-nums">
                    {i + 1}
                  </span>
                  <span className="font-medium text-foreground/90">{step}</span>
                  {i === STEPS.length - 1 && <Check className="ms-auto size-5 text-primary" />}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <TrainingPreview />
        </Reveal>
      </div>
    </section>
  );
}
