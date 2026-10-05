/**
 * Single source for landing-page business facts.
 *
 * Only publish values the gym owner has approved. `null` means "not yet
 * provided" — the UI hides that item instead of showing an invented value.
 */
export const GYM = {
  name: "ספרטא",
  location: "אבני חפץ, שומרון",
  hours: [
    { days: "א׳–ה׳", time: "06:00–22:00" },
    { days: "ו׳", time: "06:00–14:00" },
  ],
  /** E.g. "050-000-0000". Missing — needed before public launch. */
  phone: null as string | null,
  email: null as string | null,
  /** Routes/URLs for legal pages. Missing — needed before public launch. */
  privacyUrl: null as string | null,
  termsUrl: null as string | null,
} as const;

/**
 * Pricing is a product proposal awaiting approval (plan §6, §16). It renders in
 * dev, or in a build with VITE_SHOW_PRICING=true, and is hidden otherwise.
 */
export const SHOW_PRICING = import.meta.env.DEV || import.meta.env.VITE_SHOW_PRICING === "true";

/** Marks stand-in assets (e.g. hero photo) so they are not mistaken for final. */
export const SHOW_PLACEHOLDER_TAGS = import.meta.env.DEV;

export const NAV_LINKS = [
  { label: "תוכניות", href: "#programs" },
  { label: "המכון", href: "#gym" },
  { label: "האפליקציה", href: "#app" },
  ...(SHOW_PRICING ? [{ label: "מחירים", href: "#pricing" }] : []),
  { label: "צור קשר", href: "#contact" },
];

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
