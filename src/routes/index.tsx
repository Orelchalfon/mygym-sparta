import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, MapPin, Clock, Phone, Users, Flame } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Header } from "@/components/ui/header-2";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
  ENTER_TRANSITION,
} from "@/components/landing/motion";
import { TrainingPreview } from "@/components/landing/training-preview";
import { AnimatedCounter } from "@/components/landing/animated-counter";
import { AREAS, REST_SECONDS } from "@/lib/workout.constants";
import heroImage from "@/assets/sparta-hero.jpg";

const SITE_URL = "https://mygym-sparta.lovable.app";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "מכון כושר ספרטא — אבני חפץ, שומרון | אימונים לגברים ולנשים" },
      {
        name: "description",
        content:
          "מכון כושר ספרטא באבני חפץ — מכון כושר מוביל בשומרון לגברים ולנשים. ציוד מתקדם, אווירה מקצועית ושעות גמישות. בואו להתאמן אצלנו.",
      },
      {
        name: "keywords",
        content:
          "מכון כושר, מכון כושר לגברים, מכון כושר לנשים, מכון כושר בשומרון, מכון כושר אבני חפץ, ספרטא, אימוני כוח, חדר כושר",
      },
      { property: "og:title", content: "מכון כושר ספרטא — אבני חפץ, שומרון" },
      {
        property: "og:description",
        content:
          "מכון כושר מוביל בשומרון לגברים ולנשים. בואו להתאמן בספרטא.",
      },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${SITE_URL}${heroImage}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "מכון כושר ספרטא — אבני חפץ, שומרון" },
      { name: "twitter:image", content: `${SITE_URL}${heroImage}` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HealthClub",
          "@id": `${SITE_URL}/#gym`,
          name: "מכון כושר ספרטא",
          alternateName: "Sparta Gym",
          description:
            "מכון כושר באבני חפץ, שומרון — אימונים לגברים ולנשים, ציוד מתקדם ואווירה מקצועית.",
          url: SITE_URL,
          image: `${SITE_URL}${heroImage}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: "אבני חפץ",
            addressRegion: "שומרון",
            addressCountry: "IL",
          },
          areaServed: ["אבני חפץ", "שומרון", "השומרון"],
          priceRange: "₪₪",
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
              opens: "06:00",
              closes: "22:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Friday",
              opens: "06:00",
              closes: "14:00",
            },
          ],
        }),
      },
    ],
  }),
});

function LandingPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // Subtle hero parallax — transform-only, disabled under reduced motion.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) {
        navigate({ to: "/areas" });
      }
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const navLinks = [
    { label: "אודות", href: "#about" },
    { label: "ציוד", href: "#equipment" },
    { label: "אימון", href: "#preview" },
    { label: "צור קשר", href: "#contact" },
  ];

  const stats = [
    { to: AREAS.length, suffix: "", label: "אזורי אימון" },
    { to: 20, suffix: "+", label: "מכשירים" },
    { to: REST_SECONDS, suffix: "ש׳", label: "טיימר מנוחה" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Header
        links={navLinks}
        transparentOnTop
        onSignIn={() => navigate({ to: "/auth" })}
        onGetStarted={() => navigate({ to: "/auth" })}
        leadingActions={<ThemeToggle />}
      />

      {/* Hero */}
      <section ref={heroRef} className="relative isolate overflow-hidden pt-16">
        <motion.div
          className="absolute inset-0 -z-10 scale-110 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
            y: reduce ? undefined : parallaxY,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-l from-black/90 via-black/70 to-black/50"
          aria-hidden="true"
        />
        <StaggerGroup
          trigger="mount"
          stagger={0.12}
          delayChildren={0.15}
          className="container mx-auto px-6 py-24 md:py-36 max-w-5xl"
        >
          <StaggerItem className="inline-flex items-center gap-2 rounded-full border border-red-600/40 bg-red-600/10 px-4 py-1.5 text-sm text-red-400 mb-6">
            <Flame className="h-4 w-4" />
            <span>אבני חפץ · שומרון</span>
          </StaggerItem>
          <StaggerItem>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
              מכון כושר <span className="text-red-600">ספרטא</span>
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-6 text-xl md:text-2xl text-zinc-200 max-w-2xl">
              מכון הכושר המוביל בשומרון — אימונים לגברים ולנשים, ציוד מתקדם,
              אווירה של ניצחון.
            </p>
          </StaggerItem>
          <StaggerItem className="mt-10 flex flex-wrap gap-4">
            <motion.div
              whileHover={reduce ? undefined : { scale: 1.04 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 h-14"
              >
                <Link to="/areas">כניסה למתאמנים</Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={reduce ? undefined : { scale: 1.04 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
            >
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 h-14 bg-transparent"
              >
                <a href="#contact">צור קשר</a>
              </Button>
            </motion.div>
          </StaggerItem>
        </StaggerGroup>
      </section>

      {/* Stats strip */}
      <StaggerGroup className="container mx-auto px-6 max-w-5xl -mt-8 md:-mt-12 relative z-10">
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card/80 p-5 shadow-xl backdrop-blur sm:gap-6 sm:p-8">
          {stats.map((s) => (
            <StaggerItem key={s.label} className="text-center">
              <div className="text-3xl font-black text-primary sm:text-5xl">
                <AnimatedCounter to={s.to} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {s.label}
              </div>
            </StaggerItem>
          ))}
        </div>
      </StaggerGroup>

      {/* About */}
      <section id="about" className="container mx-auto px-6 py-20 max-w-5xl">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            מכון הכושר שלנו
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            ספרטא הוא מכון כושר בשומרון, ממוקם בלב אבני חפץ, ומציע סביבת אימון
            מקצועית לכל רמה. בין אם אתם מתאמנים ותיקים או רק מתחילים את הדרך,
            אצלנו תמצאו את הכלים, האווירה והליווי שיעזרו לכם להגיע ליעדים.
          </p>
        </Reveal>
      </section>

      {/* App preview — the training flow "screenshot" */}
      <section
        id="preview"
        className="container mx-auto px-6 py-20 max-w-6xl overflow-x-clip"
      >
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
              <Dumbbell className="h-4 w-4" />
              <span>האפליקציה למתאמנים</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-5">
              מנהלים את האימון <span className="text-primary">בלייב</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              בוחרים אזור שריר, פותחים את המכשיר עם המשקל המדויק, מסמנים כל סט
              שמסיימים — וטיימר המנוחה מתחיל אוטומטית. הכול במקום אחד, בעברית
              ובהתאמה מלאה למסך.
            </p>
            <ul className="space-y-3">
              {[
                "בחירת אזורי אימון לפי קבוצת שריר",
                "כרטיס מכשיר עם משקל, סטים וחזרות",
                "מעקב סטים וכפתור „סיימתי סט”",
                "טיימר מנוחה מעגלי אוטומטי",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <Flame className="size-3" />
                  </span>
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <TrainingPreview />
          </Reveal>
        </div>
      </section>

      {/* Men + Women */}
      <section className="container mx-auto px-6 py-20 max-w-5xl">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-black mb-10">
            אימונים לגברים ולנשים
          </h2>
        </Reveal>
        <StaggerGroup className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "מכון כושר לגברים",
              body: "אזור אימון מלא בציוד כוח כבד, משקולות חופשיות ומכשירים מתקדמים. מתאים לבניית מסה, כוח וכושר.",
            },
            {
              title: "מכון כושר לנשים",
              body: "שעות ייעודיות ואזור אימון נעים ומכבד. ציוד אירובי וכוח לכל מטרה — חיטוב, חיזוק ובריאות.",
            },
          ].map((c) => (
            <StaggerItem
              key={c.title}
              whileHover={reduce ? undefined : { y: -6 }}
              transition={ENTER_TRANSITION}
            >
              <Card className="h-full p-8 border-red-600/20 bg-card transition-colors hover:border-red-600/60 hover:shadow-xl hover:shadow-red-600/5">
                <Users className="h-10 w-10 text-red-600 mb-4" />
                <h3 className="text-2xl font-bold mb-3">{c.title}</h3>
                <p className="text-muted-foreground">{c.body}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Equipment */}
      <section id="equipment" className="container mx-auto px-6 py-20 max-w-5xl">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-black mb-10">ציוד ומכשירים</h2>
        </Reveal>
        <StaggerGroup
          stagger={0.05}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          {[
            "משקולות חופשיות עד 50 ק״ג",
            "מתלי סקוואט ובנץ׳ פרס",
            "כבלים רב-תכליתיים",
            "מכשירי כוח לכל קבוצת שריר",
            "אזור אירובי — הליכונים ואופניים",
            "אזור גמישות ומתיחות",
          ].map((item) => (
            <StaggerItem
              key={item}
              whileHover={reduce ? undefined : { y: -4 }}
              transition={ENTER_TRANSITION}
              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card transition-colors hover:border-red-600/40"
            >
              <Dumbbell className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <span>{item}</span>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Location + Contact */}
      <section
        id="contact"
        className="container mx-auto px-6 py-20 max-w-5xl border-t border-border"
      >
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-black mb-10">
            מיקום ויצירת קשר
          </h2>
        </Reveal>
        <StaggerGroup className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: MapPin,
              title: "מיקום",
              lines: ["אבני חפץ, שומרון"],
            },
            {
              icon: Clock,
              title: "שעות פתיחה",
              lines: ["א׳–ה׳ 06:00–22:00", "ו׳ 06:00–14:00"],
            },
            {
              icon: Phone,
              title: "צור קשר",
              lines: ["פנו אלינו לפרטים נוספים"],
            },
          ].map(({ icon: Icon, title, lines }) => (
            <StaggerItem
              key={title}
              whileHover={reduce ? undefined : { y: -6 }}
              transition={ENTER_TRANSITION}
            >
              <Card className="h-full p-6 bg-card border-border transition-colors hover:border-red-600/40">
                <Icon className="h-8 w-8 text-red-600 mb-3" />
                <h3 className="font-bold text-lg mb-1">{title}</h3>
                {lines.map((l) => (
                  <p key={l} className="text-muted-foreground">
                    {l}
                  </p>
                ))}
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Footer CTA */}
      <section className="bg-red-600 py-16">
        <Reveal className="container mx-auto px-6 max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            מוכנים להתחיל?
          </h2>
          <motion.div
            className="inline-block"
            whileHover={reduce ? undefined : { scale: 1.05 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-black hover:bg-zinc-900 text-white font-bold text-lg px-8 h-14"
            >
              <Link to="/areas">כניסה למתאמנים</Link>
            </Button>
          </motion.div>
        </Reveal>
      </section>
    </div>
  );
}
