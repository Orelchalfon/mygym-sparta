import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Dumbbell, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { GYM, NAV_LINKS, telHref } from "@/components/landing/content";

/**
 * Landing header: transparent over the hero, then condenses into a floating
 * dark pill once the page scrolls. The mobile menu renders inline (no portal)
 * so it stays inside the `.landing` theme scope.
 */
export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(24);
  const pill = scrolled || open;

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          "landing-rise mx-auto border transition-[max-width,background-color,border-color,border-radius,box-shadow] duration-500",
          pill
            ? "max-w-5xl rounded-[1.75rem] border-border bg-card/85 shadow-2xl shadow-black/40 backdrop-blur-xl"
            : "max-w-7xl rounded-[1.75rem] border-transparent bg-transparent",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-4 ps-4 pe-2 sm:h-16 sm:ps-6 sm:pe-3">
          <a href="#top" className="flex items-center gap-2 text-lg font-black">
            <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Dumbbell className="size-4" />
            </span>
            <span>{GYM.name}</span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="ניווט ראשי">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-[15px] font-medium text-foreground/70 transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {GYM.phone && (
              <a
                href={telHref(GYM.phone)}
                className="flex items-center gap-2 px-3 text-sm font-medium text-foreground/80 hover:text-foreground"
              >
                <Phone className="size-4 text-primary" />
                <bdi>{GYM.phone}</bdi>
              </a>
            )}
            <Link
              to="/auth"
              className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
            >
              כניסה
            </Link>
            <Link
              to="/auth"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              התחילו להתאמן
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="grid size-11 place-items-center rounded-full text-foreground hover:bg-white/5 lg:hidden"
          >
            <MenuToggleIcon open={open} className="size-6" />
          </button>
        </div>

        <div
          id="landing-mobile-menu"
          className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out lg:hidden",
            open ? "max-h-[32rem] opacity-100" : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <nav className="flex flex-col gap-1 px-3 pb-2" aria-label="ניווט נייד">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-lg font-semibold text-foreground/85 hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 px-3 pb-4">
            {GYM.phone && (
              <a
                href={telHref(GYM.phone)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold"
              >
                <Phone className="size-5 text-primary" />
                <bdi>{GYM.phone}</bdi>
              </a>
            )}
            <Link
              to="/auth"
              className="flex h-12 items-center justify-center rounded-full border border-border font-semibold"
            >
              כניסה
            </Link>
            <Link
              to="/auth"
              className="flex h-12 items-center justify-center rounded-full bg-white font-bold text-black"
            >
              התחילו להתאמן
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
