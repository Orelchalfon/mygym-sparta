import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, MapPin, Clock, Phone, Users, Flame } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-l from-black/90 via-black/70 to-black/50"
          aria-hidden="true"
        />
        <div className="container mx-auto px-6 py-24 md:py-36 max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-600/40 bg-red-600/10 px-4 py-1.5 text-sm text-red-400 mb-6">
            <Flame className="h-4 w-4" />
            <span>אבני חפץ · שומרון</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
            מכון כושר <span className="text-red-600">ספרטא</span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-zinc-200 max-w-2xl">
            מכון הכושר המוביל בשומרון — אימונים לגברים ולנשים, ציוד מתקדם, אווירה
            של ניצחון.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 h-14"
            >
              <Link to="/areas">כניסה למתאמנים</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 h-14 bg-transparent"
            >
              <a href="#contact">צור קשר</a>
            </Button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="container mx-auto px-6 py-20 max-w-5xl">
        <h2 className="text-4xl md:text-5xl font-black mb-6">מכון הכושר שלנו</h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          ספרטא הוא מכון כושר בשומרון, ממוקם בלב אבני חפץ, ומציע סביבת אימון
          מקצועית לכל רמה. בין אם אתם מתאמנים ותיקים או רק מתחילים את הדרך, אצלנו
          תמצאו את הכלים, האווירה והליווי שיעזרו לכם להגיע ליעדים.
        </p>
      </section>

      {/* Men + Women */}
      <section className="container mx-auto px-6 py-20 max-w-5xl">
        <h2 className="text-4xl md:text-5xl font-black mb-10">
          אימונים לגברים ולנשים
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 border-red-600/20 bg-card hover:border-red-600/60 transition-colors">
            <Users className="h-10 w-10 text-red-600 mb-4" />
            <h3 className="text-2xl font-bold mb-3">מכון כושר לגברים</h3>
            <p className="text-muted-foreground">
              אזור אימון מלא בציוד כוח כבד, משקולות חופשיות ומכשירים מתקדמים.
              מתאים לבניית מסה, כוח וכושר.
            </p>
          </Card>
          <Card className="p-8 border-red-600/20 bg-card hover:border-red-600/60 transition-colors">
            <Users className="h-10 w-10 text-red-600 mb-4" />
            <h3 className="text-2xl font-bold mb-3">מכון כושר לנשים</h3>
            <p className="text-muted-foreground">
              שעות ייעודיות ואזור אימון נעים ומכבד. ציוד אירובי וכוח לכל מטרה —
              חיטוב, חיזוק ובריאות.
            </p>
          </Card>
        </div>
      </section>

      {/* Equipment */}
      <section className="container mx-auto px-6 py-20 max-w-5xl">
        <h2 className="text-4xl md:text-5xl font-black mb-10">ציוד ומכשירים</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            "משקולות חופשיות עד 50 ק״ג",
            "מתלי סקוואט ובנץ׳ פרס",
            "כבלים רב-תכליתיים",
            "מכשירי כוח לכל קבוצת שריר",
            "אזור אירובי — הליכונים ואופניים",
            "אזור גמישות ומתיחות",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card"
            >
              <Dumbbell className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Location + Contact */}
      <section
        id="contact"
        className="container mx-auto px-6 py-20 max-w-5xl border-t border-border"
      >
        <h2 className="text-4xl md:text-5xl font-black mb-10">מיקום ויצירת קשר</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border">
            <MapPin className="h-8 w-8 text-red-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">מיקום</h3>
            <p className="text-muted-foreground">אבני חפץ, שומרון</p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <Clock className="h-8 w-8 text-red-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">שעות פתיחה</h3>
            <p className="text-muted-foreground">א׳–ה׳ 06:00–22:00</p>
            <p className="text-muted-foreground">ו׳ 06:00–14:00</p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <Phone className="h-8 w-8 text-red-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">צור קשר</h3>
            <p className="text-muted-foreground">פנו אלינו לפרטים נוספים</p>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-red-600 py-16">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            מוכנים להתחיל?
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-black hover:bg-zinc-900 text-white font-bold text-lg px-8 h-14"
          >
            <Link to="/areas">כניסה למתאמנים</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
