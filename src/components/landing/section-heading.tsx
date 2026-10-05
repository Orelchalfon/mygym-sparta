import type { ReactNode } from "react";
import { Reveal } from "@/components/landing/motion";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <span className="h-px w-8 bg-primary" />
        {eyebrow}
      </div>
      <h2 className="landing-h2">{title}</h2>
      {lead && <p className="mt-5 text-lg leading-relaxed text-foreground/65">{lead}</p>}
    </Reveal>
  );
}
