# MedMac — promo site

A two-page promotional site for MedMac, a concept AI doctor kiosk. The kiosk takes vitals, listens in the patient's language, lets them point at where it hurts, matches them to a department, takes payment and puts them in the right doctor's queue.

> Concept prototype. Not a certified medical device. Every figure, name and reading on the site is a placeholder.

## Run it

```bash
npm install && npm run dev
```

The site runs on Vite's dev server. `npm run build` type-checks the project and writes a production bundle to `dist/`. `npm run preview` serves that bundle.

**Stack:** Vite 7, React 19, TypeScript, Tailwind CSS 4, GSAP 3 (ScrollTrigger, SplitText), Lenis smooth scroll and React Router 7.

## Pages

| Route   | What's on it |
|---------|--------------|
| `/`     | The hero: the kiosk photo with GSAP-dealt status cards and mouse parallax. Then a language marquee. "One screen. Five ways in.": the home screen's buttons as a hand of cards that fans open on scroll. The six-beat flow as a pinned deck, where each beat tosses the last card away. The interactive anatomical hologram. The pay and queue mock. Illustrative figures on cards that flip over. The footer. |
| `/team` | Two people, each with a photo, a bio and academic and professional timelines. |

## Changing things

### Name, contact, copy

`src/data/site.ts` holds:
- the product name (`site.name`), tagline, contact email and footer disclaimer;
- the languages in the marquee;
- the flow beats, the home-screen cards (`screens`) and the illustrative stats.

Every page reads from this file.

### Colours

All colours are tokens in `src/styles/index.css`.

| Token | Value | Use |
|-------|-------|-----|
| `--color-night` | `#07080a` | The default dark canvas |
| `--color-signal` | `#4aa3ff` | The kiosk's blue edge light: glows and halos |
| `--color-ember` | `#e9a440` | The warm accent, used sparingly: primary buttons, the queue token, the active beat |
| `--color-holo` / `--color-holo-ground` | `#7fdbff` / `#050d1c` | The hologram section |
| `--color-paper` | `#f3efe7` | The printed report card |

Sections pick a theme with a class:
- `theme-dark` is the default;
- `theme-light`, `theme-holo` and `theme-ember` are the alternatives.

Each theme sets the role tokens `--ground`, `--raised`, `--fg`, `--fg-dim`, `--line` and `--accent`. Components only use the role tokens, so a palette change happens in one place.

### Fonts

- **Satoshi** (Fontshare) is the only Latin face. It is loaded in `index.html` and mapped to `--font-display` and `--font-sans` in `index.css`. To swap it, change the stylesheet link and those two variables.
- **Noto Sans** (Devanagari, Oriya, Bengali, Tamil, Telugu, …) renders the Indian scripts. `src/lib/fonts.ts` loads it from Google Fonts, subset to the characters the page actually uses.

### Team data and photos

- Names, roles, bios and timelines live in `src/data/team.ts`.
- Photos go at:
  - `src/assets/team/person-1.jpg`
  - `src/assets/team/person-2.jpg`

  These match the `photo` paths in `team.ts`. Portrait crops of about 4:5 work best.
- Until a file exists, the page shows an animated placeholder frame with the person's initials, so nothing breaks.

### The kiosk photo

The hero uses the first image found in `src/assets/kiosk/`. It accepts `.jpg`, `.png`, `.webp` and `.avif`.

To swap it, replace `medmac-kiosk.webp` with a cut-out (transparent background) render of the machine. If the folder is empty, the hero falls back to the illustrated SVG kiosk.

The current photo carries "AI Doctor" branding on the machine. Swap it for a MedMac-branded render before launch.

## Motion and accessibility

- All animation goes through `gsap.matchMedia()` (see `src/lib/motion.ts`). With `prefers-reduced-motion: reduce`:
  - scroll scrubbing, pinning and parallax are off;
  - the card hands are shown already laid out;
  - counters show their final values.
- Mouse parallax runs only on fine pointers.
- A skip link and visible focus rings are included. Decorative cards are `aria-hidden`; the real content stays in semantic headings, lists and `<dl>`s.
