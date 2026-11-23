# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Mobile-first web app, installable as a PWA. An Android TWA wrapper (Play Store) is built but parked; it wraps the same web app and does not change the design language. Native iOS/Android apps are a later phase.

## Users

- **Primary:** members of Sparta Gym (מכון כושר ספרטא, Avnei Hefetz), men and women at every level, using the app on their phone on the gym floor in the middle of a workout: pick a muscle area, open a machine, set weight/reps, tap ״סיימתי סט״, let the rest timer run, review history.
- **Prospective members** reach the public landing page to learn about the gym and sign up.
- The product is built by an independent developer for the gym; the gym owner signs off on business facts.

## Product Purpose

Give Sparta members one place that pairs the physical gym with a digital coach: reliable workout logging today; a gym map, AI food scanning, and monthly training plans next. Success means members actually use it during workouts, and their logged history is trustworthy (never lost or overwritten).

## Positioning

The gym and its digital coach in one product. Workout tracking, nutrition scanning and plans are tied to Sparta's own equipment, areas and services, not offered as a generic tracker.

## Operating Context

- Used one-handed, between sets, in a gym: short attention, sweaty hands, glance-and-tap interactions.
- Hebrew-only, RTL (`lang="he" dir="rtl"`).
- A QR code at the gym is **only for downloading/opening the app**, and not yet in use. There are no QR codes on machines; don't design machine-QR flows.
- The gym also has opening hours, dedicated time slots and a mixed (men and women) clientele, as stated on the landing page.

## Capabilities and Constraints

**Live today:** public landing page (hero, programs, gym proof, app preview, pricing, CTA, footer); email/password auth with password reset; areas → exercise catalog by muscle area; per-exercise weight/reps/sets; ״סיימתי סט״ with a rest timer; workout history by session; an embedded Spotify player; PWA install prompt.

**Stack (existing):** React 19 + TypeScript, TanStack Start/Router/Query (SSR, server functions, Netlify), Tailwind 4, shadcn/Radix, Motion, Supabase (Postgres + RLS, Auth). Connected to Lovable: never rewrite pushed history.

**Planned, not built:** a simple 3D interactive gym map (machine list stays a full accessible alternative), AI food-photo scanning, monthly workout plans/calendar, a digital subscription and billing, admin.

**Undecided:** the digital subscription pricing (39 ₪ for the first two billing cycles, then 79 ₪/month; 10 free one-time AI scans) is a **proposal** pending owner approval. Don't present it as final. The scan quota for subscribers is undefined. The digital subscription does not grant gym entry.

**Terminology:** ״סיימתי סט״ (logged per set, not per rep); muscle "areas" (אזורים); מנוי דיגיטלי vs. the physical gym membership.

## Brand Commitments

- Name: Sparta Gym / ספרטא. Manifest identity: "מכון כושר ספרטא — אבני חפץ".
- Hebrew voice addressing members in the plural (״התחילו בחינם״, ״מה מחכה לכם״); welcoming and respectful (״אווירה נעימה ומכבדת״), for every goal (חיטוב, חיזוק, בריאות).

## Evidence on Hand

- **Confirmed real:** gym photos (`src/assets/sparta-hero*`, `src/assets/facilities/`, `src/assets/images/`, `src/assets/machines/`), licensed for marketing; opening hours, phone and address as shown on the site; the "20+ machines" claim.
- **Not available, must not be fabricated:** testimonials, coach profiles, member counts or other statistics, social proof. Add these only with approved real content. A 45-second rest timer is not social proof.

## Product Principles

1. **Never lose a workout.** Logged sets and history are the product's trust; reliability beats features.
2. **Built for the gym floor.** Every in-workout action works fast, one-handed, on a phone, mid-set.
3. **Real gym, real facts.** Only confirmed equipment, hours, prices and content; proposals stay labelled as proposals.
4. **Gym first, digital coach second.** Digital features extend the physical gym experience. They never replace it or imply things they don't grant (e.g. gym access).
5. **Hebrew-native.** RTL and Hebrew typography are the default, not a translation layer.
