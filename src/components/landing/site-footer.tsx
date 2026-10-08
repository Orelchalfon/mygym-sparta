import { Link } from "@tanstack/react-router";
import { Clock, Dumbbell, Mail, MapPin, Phone } from "lucide-react";
import { GYM, NAV_LINKS, telHref } from "@/components/landing/content";

export function SiteFooter() {
  const legal = [
    { label: "מדיניות פרטיות", href: GYM.privacyUrl },
    { label: "תנאי שימוש", href: GYM.termsUrl },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <footer id="contact" className="scroll-mt-24 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-xl font-black">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Dumbbell className="size-4" />
            </span>
            מכון כושר {GYM.name}
          </div>
          <p className="mt-4 max-w-xs text-foreground/60">
            מכון כושר לגברים ולנשים ב{GYM.location}.
          </p>
        </div>

        <nav aria-label="ניווט תחתון">
          <h3 className="font-bold">ניווט</h3>
          <ul className="mt-4 space-y-2.5 text-foreground/65">
            {NAV_LINKS.filter((l) => l.href !== "#contact").map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/auth" className="hover:text-foreground">
                כניסה למתאמנים
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="flex items-center gap-2 font-bold">
            <Clock className="size-4 text-primary" />
            שעות פתיחה
          </h3>
          <ul className="mt-4 space-y-2.5 text-foreground/65">
            {GYM.hours.map((h) => (
              <li key={h.days} className="flex max-w-56 justify-between gap-6">
                <span>{h.days}</span>
                <bdi className="tabular-nums">{h.time}</bdi>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold">צור קשר</h3>
          <ul className="mt-4 space-y-3 text-foreground/65">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {GYM.location}
            </li>
            {GYM.phone && (
              <li>
                <a
                  href={telHref(GYM.phone)}
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <Phone className="size-4 text-primary" />
                  <bdi>{GYM.phone}</bdi>
                </a>
              </li>
            )}
            {GYM.email && (
              <li>
                <a
                  href={`mailto:${GYM.email}`}
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <Mail className="size-4 text-primary" />
                  <bdi>{GYM.email}</bdi>
                </a>
              </li>
            )}
            {!GYM.phone && !GYM.email && <li>פנו אלינו במכון לפרטים נוספים</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-foreground/45 sm:px-6">
          <span>
            <bdi>© {new Date().getFullYear()}</bdi> מכון כושר {GYM.name}
          </span>
          {legal.length > 0 && (
            <ul className="flex gap-5">
              {legal.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-foreground">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
