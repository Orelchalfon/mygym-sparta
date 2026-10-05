import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/landing/motion";

export function FinalCTA() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-primary px-6 py-20 text-center text-white sm:py-28">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_20%,white,transparent_45%)]"
        />
        <p className="relative text-lg font-semibold text-white/80">זה המקום</p>
        <h2 className="landing-display relative mt-3">
          הגרסה החזקה שלך
          <br />
          מתחילה כאן.
        </h2>
        <Link
          to="/auth"
          className="relative mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-white ps-7 pe-2 font-bold text-black transition-transform hover:-translate-y-0.5"
        >
          התחילו להתאמן
          <span className="grid size-10 place-items-center rounded-full bg-black text-white">
            <ArrowLeft className="size-4" />
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
