import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { BenefitsTicker } from "@/components/landing/benefits-ticker";
import { Programs } from "@/components/landing/programs";
import { GymProof } from "@/components/landing/gym-proof";
import { AppPreview } from "@/components/landing/app-preview";
import { Pricing } from "@/components/landing/pricing";
import { FinalCTA } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";
import { SHOW_PRICING } from "@/components/landing/content";
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
        content: "מכון כושר מוביל בשומרון לגברים ולנשים. בואו להתאמן בספרטא.",
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
    <div className="landing min-h-screen overflow-x-clip" dir="rtl" lang="he">
      <SiteHeader />
      <main>
        <Hero />
        <BenefitsTicker />
        <Programs />
        <GymProof />
        <AppPreview />
        {/* Coaches + Testimonials: slots reserved until approved content exists (plan §5). */}
        {SHOW_PRICING && <Pricing />}
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
