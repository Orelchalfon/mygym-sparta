## 1. SEO — public Hebrew landing page for Sparta Gym

**Why a landing page is required.** All `/areas/...` routes sit behind auth, so Google can't read any of your current content. Today `/` just redirects to `/areas`, leaving Googlebot with nothing. Without a real public page, no amount of meta tags will rank you for "מכון כושר אבני חפץ".

**Result:** a real public homepage at `/`, bold + energetic gym aesthetic, dark theme with red/black accents, targeting the Hebrew keywords. Logged-in users still get auto-redirected to `/areas`.

### Changes

- **`src/routes/index.tsx`** — replace the redirect with a public landing page:
  - **Hero** (full-viewport, dark, red accent): H1 `מכון כושר ספרטא — אבני חפץ`, subhead with שומרון / לגברים / לנשים phrasing, big CTA "כניסה למתאמנים" → `/areas`, secondary CTA "צור קשר".
  - **Sections** (each with its own H2 for keyword coverage):
    - "מכון הכושר שלנו" (about) — short paragraph mentioning מכון כושר בשומרון.
    - "אימונים לגברים ולנשים" — two-column highlight.
    - "ציוד ומכשירים" — short list.
    - "מיקום ושעות פתיחה" — placeholder address/hours (you can edit).
    - "צור קשר" — phone/email placeholders.
  - Components from existing shadcn set (Button, Card) — no new package needed. Animated reveals via Framer Motion (already in the project if available; otherwise plain CSS transitions).
  - **Auto-redirect for logged-in users**: a tiny `useEffect` that checks the Lovable Cloud session and `navigate({ to: "/areas" })` if authenticated. Logged-out visitors and Googlebot see the landing page.
  - **`head()`**: page-specific title/description/og tags + `<link rel="canonical">` + **LocalBusiness JSON-LD** (`@type: "HealthClub"`, `name: "מכון כושר ספרטא"`, `address.addressLocality: "אבני חפץ"`, `address.addressRegion: "שומרון"`, `url`, opening hours placeholder, `@id`). LocalBusiness is the single strongest signal for local "מכון כושר ב..." searches.

- **`src/routes/__root.tsx`** — change default title/description to Sparta-focused copy ("מכון כושר ספרטא — אבני חפץ, שומרון | אימונים לגברים ולנשים"), update `og:site_name`. Add a `keywords` meta with your list (low-impact but harmless).

- **Hero image** — generate a 1920×1080 bold gym hero (dark, red accent, barbell/dumbbells silhouette) and use it both as the landing hero and the new `og:image` (your current og:image is a generic Lovable upload). Hosted in `src/assets/`.

- **`src/routes/sitemap[.]xml.ts`** — confirm `/` is listed with priority 1.0 (already is per the template).

- **`public/robots.txt`** — already correct, no change.

### Realistic expectations
Google indexing is not instant. After deploy, the user should:
1. Open Google Search Console (already connected) → submit `https://mygym-sparta.lovable.app/sitemap.xml`.
2. Use "URL Inspection" → "Request indexing" for `/`.
Typical visibility for a brand-new local page: a few days to a couple of weeks. Local-pack ranking ("מכון כושר אבני חפץ") also benefits from a **Google Business Profile** — I'll mention this in the closing message; it's outside the codebase.

## 2. Installable PWA (like Kaspii)

Manifest-only installability — exactly what gives Chrome/Edge the "Install app" prompt and Safari "Add to Home Screen" with a proper icon and standalone window. No service worker, no offline complexity, no risk of stale-cache bugs in the Lovable preview.

### Changes

- **`public/manifest.webmanifest`** (new):
  ```json
  {
    "name": "Sparta Gym",
    "short_name": "Sparta Gym",
    "description": "מכון כושר ספרטא — אבני חפץ",
    "start_url": "/areas",
    "scope": "/",
    "display": "standalone",
    "orientation": "portrait",
    "background_color": "#0a0a0a",
    "theme_color": "#dc2626",
    "lang": "he",
    "dir": "rtl",
    "icons": [
      { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
      { "src": "/favicon.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
      { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" }
    ]
  }
  ```
- **`src/routes/__root.tsx`** — add to `links`:
  - `{ rel: "manifest", href: "/manifest.webmanifest" }`
  - add `meta`: `{ name: "theme-color", content: "#dc2626" }`, `{ name: "mobile-web-app-capable", content: "yes" }`, `{ name: "apple-mobile-web-app-capable", content: "yes" }`, `{ name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" }`, `{ name: "apple-mobile-web-app-title", content: "Sparta Gym" }`.

### Behavior
- **Android Chrome / Edge**: shows native "Install app" banner automatically after engagement; appears as a real app with icon, no browser chrome.
- **iOS Safari**: no automatic banner (Apple limitation — same as your Kaspii app on iPhone); user taps Share → "Add to Home Screen", then it launches standalone with the icon and "Sparta Gym" label.
- **Lovable preview**: install prompts are suppressed in preview/dev — works only after publish (this is normal and matches how Kaspii works).
