---
name: MedMac
description: Promo site for a hospital kiosk that carries a patient from vitals to the right doctor's queue, dealt out as cards in a dark showroom.
colors:
  graphite-night: "#07080a"
  graphite-raised: "#111317"
  slab-top: "#15181e"
  slab-bottom: "#0c0d10"
  bone: "#eceae4"
  bone-dim: "#9c9ea5"
  kiosk-signal: "#4aa3ff"
  ember: "#e9a440"
  ember-deep: "#b8741c"
  ember-text-light: "#8f500a"
  ink: "#14161a"
  paper: "#f3efe7"
  holo: "#7fdbff"
  holo-deep: "#2f8cff"
  holo-ground: "#050d1c"
  holo-raised: "#0a1830"
typography:
  display:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.4rem, 6vw, 6.25rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.4vw, 5.6rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 2vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.2vw, 1.15rem)"
    fontWeight: 500
    lineHeight: 1.625
  label:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.08em"
  script:
    fontFamily: "Noto Sans Devanagari, Noto Sans Oriya, Noto Sans Bengali, Noto Sans Tamil, Noto Sans Telugu, Noto Sans Gujarati, Noto Sans Kannada, Noto Sans Malayalam, Noto Sans Gurmukhi, Satoshi, sans-serif"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  focus: "2px"
  card-sm: "18px"
  card: "22px"
  card-lg: "26px"
  pill: "9999px"
spacing:
  gutter: "clamp(1rem, 3.2vw, 3rem)"
  section: "clamp(6rem, 16vh, 12rem)"
components:
  button-primary:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "16px 28px"
  button-primary-hover:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.graphite-night}"
  button-ghost:
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "16px 28px"
  nav-pill:
    backgroundColor: "{colors.graphite-raised}"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
  card-glass:
    textColor: "{colors.bone}"
    rounded: "{rounded.card-sm}"
    padding: "16px"
  card-slab:
    backgroundColor: "{colors.slab-bottom}"
    textColor: "{colors.bone}"
    rounded: "{rounded.card-lg}"
    padding: "clamp(1.5rem, 2.4vw, 2.25rem)"
---

# Design System: MedMac

## Overview

**Creative North Star: "The Dealt Hand in a Dark Showroom"**

A dim showroom at night. The ground is graphite, the text is bone, and the only ambient light is the kiosk's own blue edge glow, pooled in slow drifting halos. Every idea on the page arrives as a card: glass status cards dealt out of the kiosk screen, a hand of five screens that fans open, a six-card deck where each beat tosses the last card away, figures on cards that turn over. Cards are graphite or glass slabs with hairline edges and deep, soft black shadows.

Type is one family, Satoshi, set big, bold and tight; Noto Sans carries the Indian scripts. Warm ember gold is rationed: it marks the one thing to do or the one thing that is yours. The hologram section is the single place the world turns cyan on deep navy. Motion is GSAP: expo-out entrances, scrubbed pins for card moves, one overshoot reserved for small pops. The cursor is the system cursor.

The rejected default is the healthtech SaaS page: soft blue gradient washes, smiling-doctor stock photography, flat feature-card grids.

The hero raster `src/assets/kiosk/medmac-kiosk.webp` was supplied by the user. It shows the machine with "AI Doctor" branding on its screen and base, not "MedMac"; treat it as the user's product shot, not as a source of wordmark or palette.

**Key Characteristics:**
- Graphite night ground, bone text, never bright.
- Cards as the unit of storytelling: dealt, fanned, tossed, flipped.
- Ember gold rationed to one focal mark per view.
- Kiosk blue as light (halos, pulse dots, card glyphs), never as a surface fill.
- Satoshi everywhere, display set at 700 with -0.04em tracking.
- Section themes swap the role tokens, never the markup.

## Colors

A near-black graphite world lit by one cool light, with a single rationed warm accent and a cyan sub-world for the hologram.

### Primary
- **Ember Gold** (`{colors.ember}`): the primary CTA fill, the queue token (A-17), the active nav dot, the period on the hero headline, and at most one card per hand (the token hero card, the ember Numbers card, the Pay screen). On the light theme it deepens to **Burnt Ember** (`{colors.ember-text-light}`) for text contrast. **Ember Deep** (`{colors.ember-deep}`) only tints the primary button's glow.

### Secondary
- **Kiosk Signal Blue** (`{colors.kiosk-signal}`): the machine's own edge light. Used as light only: the radial halo behind the kiosk (22% to 6% alpha), the floor glow, the live pulse dot, and the line glyphs on the glass hero cards.

### Tertiary
- **Hologram Cyan** (`{colors.holo}`) on **Hologram Navy** (`{colors.holo-ground}`, raised `{colors.holo-raised}`), with **Holo Deep** (`{colors.holo-deep}`) for depth: the Hologram section, the doctor screen card, the kiosk-screen faces, and the holo Numbers card.

### Neutral
- **Graphite Night** (`{colors.graphite-night}`): the default canvas (`:root` / `.theme-dark`), the scrollbar track.
- **Graphite Raised** (`{colors.graphite-raised}`): nav pills at 70% alpha over blur.
- **Slab Top / Slab Bottom** (`{colors.slab-top}` to `{colors.slab-bottom}`, 165deg linear): the graphite card face in Flow and Numbers.
- **Bone** (`{colors.bone}`): text on dark. **Bone Dim** (`{colors.bone-dim}`, 7.4:1 on night): secondary copy, the second hero line, card labels.
- **Hairline**: bone at 10% alpha (`rgb(236 234 228 / 0.1)`) for borders; glass cards use white at 10%.
- **Ink** (`{colors.ink}`): text on ember fills and the selection highlight.
- **Paper** (`{colors.paper}`): the printed health-report card (`.theme-light`).

### Named Rules
**The One Ember Rule.** Ember fills appear on the primary CTA, the queue token, the active beat, and one card per hand. A second ember fill in the same view is a mistake.

**The Light Not Paint Rule.** Kiosk blue is emitted, not applied: halos, glows, dots and glyph strokes. It never fills a button, card or section.

**The Role Swap Rule.** Components use only the role tokens (ground, raised, fg, fg-dim, line, accent). A section or card changes world by adding `.theme-dark`, `.theme-light`, `.theme-holo` or `.theme-ember`, never by recoloring its children.

## Typography

**Display Font:** Satoshi (Fontshare, weights 400/500/700/900), fallback ui-sans-serif, system-ui
**Body Font:** Satoshi
**Script Font:** Noto Sans Devanagari, Oriya, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Gurmukhi at 500, subset to the characters shown

**Character:** One geometric grotesk doing everything, loud at the top and quiet below; Noto Sans gives every Indian script the same plain, even voice.

### Hierarchy
- **Display** (700, clamp(3.4rem, 6vw, 6.25rem) desktop, 0.94): hero and Team headlines, page-transition words, giant numerals on flip cards (up to 10rem, 0.85).
- **Headline** (700, clamp(2.4rem, 5.4vw, 5.6rem), 0.94): section h2s, revealed by line.
- **Title** (500 to 700, clamp(1.25rem, 2vw, 2rem), -0.03em): card titles, beat titles, department names.
- **Body** (500, clamp(1rem, 1.2vw, 1.15rem), relaxed): section ledes at 34 to 44ch, set in Bone Dim.
- **Label** (500, 0.75rem, 0.08em, uppercase): footer column headings only. Card metadata uses sentence-case xs text in Bone Dim instead.

### Named Rules
**The Big and Tight Rule.** Headings are 700 with negative tracking (-0.03em to -0.04em) and line-height under 1. Never set a heading light or loose.

**The Tabular Figure Rule.** Every vital, price, token and count uses tabular numerals (`.numeric`).

## Layout

A 12-column grid inside a fluid side gutter (`{spacing.gutter}`), with sections separated by `{spacing.section}`. Headlines take 7 to 8 columns; the lede sits bottom-aligned in the remaining 4. The hero splits 6/6: copy left, kiosk right on a blue halo, with an ECG trace across the floor. Numbers stagger their three cards down the page (0, 10vh, 20vh). Screens and Flow pin for their card sequences. Below 768px everything stacks to one column; the hero keeps three of four cards around the kiosk and drops the ECG trace; below 900px, or under reduced motion, the pinned Flow deck becomes a stacked list of slabs.

## Elevation & Depth

Depth comes from deep, soft, negatively spread black shadows plus a 1px inner top highlight, glass blur over the night, and real 3D (perspective on the kiosk tilt, card flips, deck depth). No hard offset shadows.

### Shadow Vocabulary
- **Slab** (`0 40px 80px -30px rgb(0 0 0 / 0.9), inset 0 1px 0 rgb(255 255 255 / 0.07)`): Flow deck and Numbers cards; Screens uses `0 30px 60px -24px` with an 8% highlight.
- **Glass card** (`0 24px 50px -20px rgb(0 0 0 / 0.85)` + `backdrop-blur-xl`): hero status cards.
- **Pill** (`0 12px 32px -16px rgb(0 0 0 / 0.9)` + blur): nav pills.
- **Ember glow** (`0 10px 30px -12px rgb(184 116 28 / 0.7)`): primary button only.

### Named Rules
**The Deep Shadow Rule.** Shadows are black, long and soft, spread negative so they pool under the card. Colored shadow is reserved for the ember button.

## Shapes

Generous, consistent rounding. Pills (`{rounded.pill}`) for buttons, nav and the queue chip; cards from `{rounded.card-sm}` (hero glass) through `{rounded.card}` (screen hand) to `{rounded.card-lg}` (flip cards; Flow slabs run 24 to 28px). Every card has a 1px hairline border. Card proportions are portrait: 5:7 for the screen hand, 4:5 for figures.

## Components

### Buttons
Pills with a rolling label (the text slides up, a copy rolls in from below, 500ms expo-out) and a magnetic pull.
- **Shape:** full pill (`{rounded.pill}`), 16px by 28px, 0.95rem medium, -0.01em.
- **Primary:** ember fill, ink text, ember glow; hover swaps to bone fill, night text.
- **Ghost:** hairline border, bone text; hover brightens the border to bone.
- **Focus:** 2px accent outline, 4px offset.

### Navigation
Two floating pills at the top: the wordmark (ECG mark + "MedMac", 700) and the links. Graphite at 70% over blur, hairline edge. The active link carries a small ember dot that pops in with the funk overshoot; hover rolls the label. The bar hides on scroll down past 240px and returns on scroll up.

### Hero Glass Card
13.5rem (desktop) glass slab at 75 to 80% alpha over blur, 18px radius, white 10% hairline. A blue line glyph and a dim label head the card; one bold figure or phrase below. The ember variant (queue token) uses an ember 40% border. Cards are dealt out of the kiosk screen on load, float idly (7s), parallax by depth on fine pointers, and scatter upward on scroll.

### Card Slab
The graphite card face: 165deg slab gradient, hairline border, slab shadow, 24 to 28px radius. Carries the Flow beats and the Numbers faces; tones swap by theme class (graphite, ember-tinted graphite, holo navy).

### Signature Card Moves
- **Screens fan:** five 5:7 screen cards, each in its own theme, pinned and scrubbed open (+=130%, scrub 0.8).
- **Flow deck:** six pinned slabs; each beat tosses the previous card off (`xPercent 75, rotate 14`, power2.in) while the rest step forward (power3.inOut), with snap per beat.
- **Numbers flip:** cards turn from a patterned back (diagonal hairlines, blue glow, ember ECG mark) to the face.

### Motion
GSAP tokens: `expo.out` for entrances, `power4.out` soft, `expo.inOut` for transitions, and **funk** (`cubic-bezier(0.34, 1.32, 0.5, 1)`) as the only overshoot, for small pops (nav dot, chips, magnets, queue token). Durations 0.25 / 0.5 / 0.9 / 1.3 / 1.8s; char stagger 0.022s, line stagger 0.09s. Headlines reveal per char or line through masked lines. Every pinned or scrubbed move has a reduced-motion end state, and CSS animations collapse under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep the ground graphite night and let the kiosk's blue halo be the brightest ambient light.
- **Do** tell each idea as a card move: deal, fan, toss, flip.
- **Do** spend ember on one focal mark per view: the CTA, the token, the active beat, one card per hand.
- **Do** switch a section's world with a theme class and let role tokens do the recoloring.
- **Do** set every heading in Satoshi 700, tight, and every Indian script in Noto Sans 500.
- **Do** give every pinned or scrubbed move a reduced-motion end state.

### Don't:
- **Don't** brighten the page: no light sections beyond the paper report card and the ember Pay card.
- **Don't** use soft blue gradient washes, smiling-doctor stock imagery, or flat feature-card grids.
- **Don't** fill surfaces with kiosk blue; it is light only.
- **Don't** use the funk overshoot for large moves or entrances.
- **Don't** replace the system cursor.
- **Don't** put uppercase labels above headlines as kickers.
