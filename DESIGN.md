---
name: Sparta Gym
description: Hebrew-first gym companion: heavy type, one red action, built for the gym floor.
colors:
  sparta-red: "#c8262d"
  sparta-red-night: "#d93a40"
  ember: "#e4494f"
  ember-deep: "#7f1418"
  ember-red-ink: "#f0585e"
  oxblood: "#8f1d22"
  red-wash: "#f7e8e8"
  chalk: "#faf7f5"
  paper: "#ffffff"
  stone-wash: "#f1ecea"
  stone-line: "#e6dfdb"
  stone-field: "#ddd4cf"
  stone-text: "#5c5550"
  ink: "#171717"
  iron-black: "#0a0a0a"
  iron-plate: "#141414"
  iron-plate-landing: "#111111"
  iron-raised: "#1c1c1c"
  iron-line: "#262626"
  smoke: "#a1a1a1"
  bone: "#f5f5f5"
  danger: "#b91c1c"
  danger-night: "#dc2626"
typography:
  display:
    fontFamily: "Heebo Variable, Heebo, Assistant, system-ui, sans-serif"
    fontSize: "clamp(3rem, 1.4rem + 5.6vw, 7.25rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Heebo Variable, Heebo, Assistant, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.5rem + 3.2vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.015em"
  numeral:
    fontFamily: "Heebo Variable, Heebo, Assistant, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 900
    lineHeight: 1
    fontFeature: "\"tnum\" 1"
  stat:
    fontFamily: "Heebo Variable, Heebo, Assistant, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 1.1
    fontFeature: "\"tnum\" 1"
  title:
    fontFamily: "Heebo Variable, Heebo, Assistant, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Heebo Variable, Heebo, Assistant, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  lead:
    fontFamily: "Heebo Variable, Heebo, Assistant, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Heebo Variable, Heebo, Assistant, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  3xl: "22px"
  frame: "32px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  touch: "44px"
components:
  button-primary:
    backgroundColor: "{colors.sparta-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-touch:
    backgroundColor: "{colors.sparta-red}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "0 24px"
    height: "44px"
  button-set-complete:
    backgroundColor: "{colors.sparta-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.2xl}"
    height: "64px"
    width: "100%"
  button-outline:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-landing-cta:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.iron-black}"
    rounded: "{rounded.full}"
    padding: "0 8px 0 28px"
    height: "56px"
  button-landing-secondary:
    backgroundColor: "{colors.iron-black}"
    textColor: "{colors.bone}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "56px"
  input:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  area-tile:
    backgroundColor: "{colors.iron-black}"
    textColor: "{colors.paper}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  landing-pill:
    backgroundColor: "{colors.iron-plate-landing}"
    textColor: "{colors.bone}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
---

# Design System: Sparta Gym

## Overview

**Creative North Star: "The Gym-Floor Companion"**

Sparta is designed for a phone held in a sweaty hand between sets. Each screen gives one clear answer and one obvious next tap: a huge number, a heavy Hebrew title, and a single red action. Everything else steps back into warm neutral surfaces. The app gets its energy from type weight and scale (Heebo at 900) rather than from ornament, and its warmth from slightly warm, stone-tinted neutrals rather than cold greys.

The system has two registers that share one brand. The **app** (areas, exercise, rest timer, history) has light and dark themes designed together, with generous rounding and touch-sized controls. The **landing** is always dark, scoped under `.landing`. It uses tighter corners and white pill CTAs over near-black, with real gym photography, display-sized headlines, a slow benefits ticker and staggered rise-in motion. The landing persuades and the app gets out of the way.

Density is low and deliberate. Interactive targets are at least 44px, the main in-workout action is 64px tall and spans the full width, and content columns stay narrow (448px in the workout flow) so a thumb reaches everything.

**Key Characteristics:**
- Hebrew-native, RTL, logical properties throughout; directional icons flip in RTL.
- Heebo Variable only, leaning on weight 900 for every heading and number.
- One red accent, used for the action, the progress and the current state.
- Warm stone neutrals in light mode, iron blacks in dark mode and on the landing.
- Big tabular numerals for weight, reps, sets and timers.
- Liquid-glass mobile dock and a red glow under the primary action as signature depth.

## Colors

One red accent on warm neutrals: stone and chalk in light mode, iron blacks in dark mode and on the always-dark landing.

### Primary
- **Sparta Red** (sparta-red): the primary action in the light app theme: buttons, focus ring, progress stroke, current set, glass-dock ink. Tuned so white text on it passes AA (5.6:1).
- **Sparta Red, Night** (sparta-red-night): the same role in the dark app theme, lifted just enough to keep white text at AA (4.5:1).
- **Ember Red** (ember): the landing's primary accent and the dark-theme focus ring. Softer and brighter for large display type on near-black. Also exposed as the theme-invariant `--ember` token (Tailwind `ember`) for panels that stay dark in both themes: the auth brand panel, its step dots and progress, and the machine-image placeholder icon.
- **Ember Deep** (ember-deep): the dark oxblood stop in the black → red → black washes over gym photos (auth panels, `via-ember-deep/75`) and the machine-image placeholder gradient (`from-ember-deep`). Theme-invariant like Ember Red; never used as a fill on its own.
- **Ember Red Ink** (ember-red-ink): small red text and icons on the dark liquid-glass dock, lighter again to hold about 5:1 on frosted black.
- **Oxblood** (oxblood): red text on the pale red wash (light accent foreground).
- **Red Wash** (red-wash): light-theme accent and hover background; a tint, never a fill for large areas.

### Neutral
- **Chalk** (chalk): light app background. Warm off-white, never pure white.
- **Paper** (paper): light cards and popovers, one step above Chalk.
- **Stone Wash** (stone-wash): light secondary/muted surfaces and sidebar.
- **Stone Line** (stone-line) / **Stone Field** (stone-field): light borders and input strokes.
- **Stone Text** (stone-text): secondary text in light mode.
- **Ink** (ink): primary text in light mode.
- **Iron Black** (iron-black): dark app background, the landing background, and the PWA theme color.
- **Iron Plate** (iron-plate) / **Iron Plate, Landing** (iron-plate-landing): dark cards; the landing uses the slightly deeper plate.
- **Iron Raised** (iron-raised): dark secondary, muted and accent surfaces.
- **Iron Line** (iron-line): dark borders and inputs.
- **Smoke** (smoke): secondary text on dark.
- **Bone** (bone): primary text on dark.
- **Danger** (danger) / **Danger, Night** (danger-night): destructive actions only. Keep it distinct from the brand red by usage, not by hue.

### Named Rules
**The One Red Rule.** Red means one of three things: the next action, progress, or "you are here". It is never decoration, and no second accent hue competes with it (amber exists only as a chart series).

**The Warm Neutral Rule.** Light surfaces are stone-tinted (Chalk, Stone Wash), not cool grey. Pure #ffffff is reserved for raised cards (Paper) and the landing's white CTA.

## Typography

**Display Font:** Heebo Variable (with Heebo, Assistant, system-ui)
**Body Font:** Heebo Variable (same stack)

**Character:** One family carries everything. Hierarchy comes from weight jumps (400 body → 600/700 labels → 900 for every heading and number) and from scale, not from a second typeface.

### Hierarchy
- **Display** (900, clamp(3rem → 7.25rem), 0.95): landing hero headline only, with the second line in Ember Red.
- **Headline** (900, clamp(2.25rem → 4.5rem), 1): landing section headings.
- **Numeral** (900, 4.5rem, growing to 6rem on wider screens, tabular): the rest-timer countdown.
- **Stat** (900, 2.25rem, tabular): weight / reps / sets readouts on the exercise screen.
- **Title** (900, 1.5rem, growing to 1.875rem, tight tracking): app screen titles ("מה מאמנים היום?") and exercise names over photos.
- **Lead** (400, 1.125–1.25rem, relaxed): landing intro paragraphs at 70% foreground, max ~36rem.
- **Body** (400, 1rem, 1.5): default text; inputs use 16px on mobile to prevent zoom.
- **Label** (600, 0.75rem): captions above stats ("הסט הבא", units, "שעות פתיחה"), muted.

### Named Rules
**The Heavy-or-Quiet Rule.** Text is either 900 (it's a heading or a number) or 400–700 (it's reading). Mid-heavy 800 headings dilute the contrast.

**The Tabular Numbers Rule.** Every changing number (weight, reps, set count, timer, prices, hours) uses tabular figures and is isolated with `<bdi>` where it sits in RTL text.

**The No Fake Italic Rule.** Never italicize Hebrew for emphasis; use weight or Ember Red instead.

## Layout

Mobile-first, single column, RTL. The workout flow (exercise, rest) is a centered column capped at 448px with 20–24px side padding, a header that respects the safe-area top inset, and the primary action pinned to the bottom of the column with `mt-auto`. Browse screens (areas, history) widen to 1024px with a 2 → 3 → 4 column photo-tile grid (gaps of 12px, 16px from `sm`). Screens fill the dynamic viewport (`min-h-dvh`).

The landing uses a 1280px container with 16px gutters (24px from `sm`), a two-column hero at `lg` (1.3fr text / 1fr photo) that is at least 92svh tall, and stacks to text-then-image on mobile.

Spacing follows the 4px Tailwind scale; the recurring steps are 8, 12, 16 and 24px for gaps and 16–24px for card padding. On mobile, a bottom glass dock replaces the header menu (hidden from `md` up).

**The Thumb Reach Rule.** In-workout controls stay inside the 448px column and in the bottom half of the screen; nothing the user needs mid-set lives in the header.

## Elevation & Depth

Hybrid. Surfaces are mostly flat tonal layers (Chalk → Paper in light mode, Iron Black → Iron Plate in dark mode) separated by hairline borders, with soft neutral shadows on cards and photo tiles. Dark mode keeps the same shadow scale at much higher opacity so cards still lift off near-black. Three signature depth treatments sit on top of that.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)`): default cards and tiles; hover lifts to `shadow-lg`.
- **Red glow** (`box-shadow: 0 20px 25px -5px rgb(200 38 45 / 0.3), 0 8px 10px -6px rgb(200 38 45 / 0.3)`): the "סיימתי סט" button and the completion trophy only.
- **Liquid glass** (`background: var(--glass-bg); backdrop-filter: blur(24px) saturate(180%); border: 1px solid var(--glass-edge); box-shadow: inset 0 1px 0 var(--glass-highlight), inset 0 -1px 0 var(--glass-shade), 0 12px 32px -8px rgb(0 0 0 / 0.3)`): the mobile dock. Falls back to an opaque card without backdrop-filter or with reduced transparency.
- **Floating card** (`shadow-2xl` + `backdrop-blur` on 90% card): the landing hero's overlay cards.

### Named Rules
**The Glow Is Earned Rule.** The large red glow sits under exactly one element per screen: the action that completes the current step. A small glow (`shadow-md`) can mark the current item in a sequence, such as the active set dot.

## Shapes

Generously rounded and friendly in the app, tighter on the landing. The app radius base is 10px. Buttons use 8px, touch buttons 14px, photo tiles and the in-workout CTA 18px, and hero photo cards on the exercise screen 22px. Avatars, dots, badges, status pills and the landing CTAs are fully round. The landing pins its own 6px base radius so its cards read sharper, and its hero photo frame uses a 32px radius.

Photos are always clipped inside rounded frames and carry a bottom-up black gradient scrim so white text on them stays legible.

## Components

### Buttons
Chunky, confident and thumb-first.
- **Shape:** gently rounded (8px) by default; 14px at touch size; 18px for the full-width set CTA.
- **Primary:** Sparta Red fill with white text, 36px default, 44px `touch` size for anything used mid-workout.
- **Set complete (signature):** full-width, 64px, 18px corners, black-weight 18px label, Red glow, `active:scale-[0.98]` press.
- **Hover / Focus:** hover drops the fill to 90%; focus shows a 2px ring in the ring color with a 2px background offset.
- **Outline / Secondary / Ghost:** hairline border on background, a stone or iron fill, or transparent; all hover to the accent wash.
- **Landing CTA:** white pill (56px) with black text and a black circular arrow badge at the end. The secondary is a bordered pill that brightens its border on hover.

### Chips / Pills
- **Landing eyebrow pill:** fully round, hairline border, 70% card fill, 14px text, preceded by a 6px Ember Red dot.
- **Set progress dots:** a row of 32px round markers. Done sets get a 15% red tint with a red check, the current set is solid red with a small red glow, and future sets stay muted with their number.

### Cards / Containers
- **Corner Style:** 14px for standard cards; 16–22px for feature and stat containers.
- **Background:** Paper (light) / Iron Plate (dark).
- **Shadow Strategy:** Card rest, lifting on hover (see Elevation).
- **Border:** 1px Stone Line / Iron Line.
- **Internal Padding:** 24px standard; 12–20px for compact in-workout rows.
- **Stat strip:** three stat cells divided by RTL-aware vertical rules inside one rounded container.

### Inputs / Fields
- **Style:** 36px, 8px corners, 1px Stone Field stroke, transparent fill, 16px text on mobile (14px from `md`).
- **Focus:** 1px ring in the ring color, no glow.
- **Error / Disabled:** disabled at 50% opacity; errors use Danger text below the field.

### Navigation
- **App header:** brand square (40px, 14px corners, red fill with a dumbbell glyph) plus the screen title; avatar menu on desktop.
- **Mobile dock (signature):** a liquid-glass floating bar at the bottom. Closed, it previews profile, music, settings and theme; open, it shows tiles (min 64px tall, 16px corners, Ember-tinted 8% fill, 15% border) with staggered item entrance. Navigating closes it.
- **Landing header:** fixed and fully transparent at the top. On scroll it contracts (1280 → 1024px) into a frosted pill (28px corners, 85% card, hairline border, deep shadow). Nav links are round ghost pills, and the sign-up link is a white pill. Brand mark: a round red badge with a dumbbell glyph.

### Area Tile (signature)
A 4:5 photo card (18px corners) with a black gradient scrim from the bottom. The area name (title weight, white) and exercise count (tabular, 80% white) sit bottom-start; a frosted round chevron sits bottom-end and turns red on hover. Press scales to 0.98.

### Rest Timer (signature)
A 256–288px ring: muted track, Sparta Red progress stroke that animates linearly, Numeral-size countdown in the center with a "שניות" label. Below it, a "next set" row (machine thumbnail, weight × reps) and a two-button grid (skip / extend).

## Do's and Don'ts

### Do:
- **Do** use the semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`) so light, dark and landing all theme correctly.
- **Do** use logical properties (`ps-`, `pe-`, `start-`, `end-`) and flip directional icons with `rtl:-scale-x-100`.
- **Do** size anything touched mid-workout at 44px or larger (`size="touch"`, `icon-touch`), and the step-completing action at 64px.
- **Do** render every changing number with `tabular-nums`, and wrap numbers, prices and times in `<bdi>` inside Hebrew text.
- **Do** keep the landing inside `.landing` so it stays dark and keeps its 6px radius base regardless of the app theme.
- **Do** honor reduced motion: the global rule collapses transitions, and the landing rise and marquee turn off completely.
- **Do** put a bottom-up black scrim under any white text on a photo.

### Don't:
- **Don't** hardcode hex values in components; add or reuse a token. For red on an always-dark panel, use `ember` / `ember-deep`, not `primary` (which shifts to #c8262d in the light theme).
- **Don't** put the large Red glow on more than one element per screen.
- **Don't** italicize Hebrew or use synthetic slants for emphasis.
- **Don't** apply the landing's tighter radius or always-dark theme to app screens, or the app's rounder radius to the landing.
- **Don't** introduce a second typeface; hierarchy comes from Heebo's weight and size.
- **Don't** use cool grey surfaces in light mode; neutrals stay stone-warm.
