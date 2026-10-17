# 03 — Design system

## Direction: "Cinematic dark, engineered calm"

Think of a premium game studio's careers page crossed with a well-made engine's documentation: dark, quiet surfaces that let game footage glow; disciplined typography; one warm accent; precise technical metadata set in monospace. Elegant, not flashy. The footage is the color — the UI stays out of its way.

Signature details (each small, together memorable):

- **Maned-wolf amber** accent — a nod to Henry's studio, used sparingly (links, focus rings, active states, one hero underline).
- **Monospace metadata** — roles, platforms, engines, years set in a mono face like a debug readout (`ROLE  Tech Director · PLATFORM  Quest, PC VR · ENGINE  Unity`).
- **Frame-corner brackets** on featured media — thin corner marks evoking a viewfinder / selection gizmo, drawn in CSS.
- **Dev console** (`~`) — translucent HUD overlay with real Web Vitals (see `07`).

Anti-patterns to avoid: neon gradients, glassmorphism everywhere, parallax for its own sake, cursor trails, generic SaaS hero illustrations, emoji in headings, stock "gamer" fonts.

## Tokens

Defined once in `src/styles/tokens.css` as CSS custom properties. Dark is the default; light mode via `prefers-color-scheme` and a manual toggle (stored in `localStorage`, wrapped in try/catch, applied before first paint to avoid flash).

```css
:root {
  /* Color — dark (default) */
  --bg:            #0b0d10;   /* page */
  --bg-raised:     #12151a;   /* cards, header */
  --bg-sunken:     #07080a;   /* code, wells */
  --line:          #232831;   /* hairlines */
  --text:          #ecebe6;   /* primary, warm off-white */
  --text-muted:    #a3a7ae;   /* secondary — must stay ≥ 4.5:1 on --bg */
  --accent:        #f08a3c;   /* maned-wolf amber */
  --accent-strong: #ffa25a;   /* hover */
  --accent-ink:    #1a0e05;   /* text on accent */
  --focus:         #ffb877;

  /* Type */
  --font-display: "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, "SFMono-Regular", monospace;

  /* Fluid type scale (min @375px → max @1440px) */
  --step--1: clamp(0.83rem, 0.80rem + 0.15vw, 0.94rem);
  --step-0:  clamp(1.00rem, 0.96rem + 0.20vw, 1.13rem);
  --step-1:  clamp(1.20rem, 1.12rem + 0.38vw, 1.50rem);
  --step-2:  clamp(1.44rem, 1.30rem + 0.68vw, 2.00rem);
  --step-3:  clamp(1.73rem, 1.48rem + 1.15vw, 2.66rem);
  --step-4:  clamp(2.07rem, 1.66rem + 1.90vw, 3.55rem);
  --step-5:  clamp(2.49rem, 1.83rem + 3.00vw, 4.73rem);

  /* Space (4px base) */
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem;  --space-8: 2rem;   --space-12: 3rem;   --space-16: 4rem;
  --space-24: 6rem;   --space-32: 8rem;

  /* Layout */
  --measure: 68ch;          /* body text line length */
  --content: 72rem;         /* max content width */
  --gutter: clamp(1rem, 4vw, 2.5rem);
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 14px;

  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-fast: 120ms; --dur-med: 220ms; --dur-slow: 420ms;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --bg: #f6f5f1; --bg-raised: #ffffff; --bg-sunken: #ecebe6; --line: #dddbd3;
    --text: #15171b; --text-muted: #555a62;
    --accent: #b5561a; --accent-strong: #933f0c; --accent-ink: #ffffff; --focus: #b5561a;
  }
}
:root[data-theme="light"] { /* same values as above */ }
```

Rules:
- Every text/background pair is checked for WCAG 2.2 AA contrast in CI (see `07`). The light-mode accent is darkened on purpose to pass.
- No raw hex values outside `tokens.css`.

## Typography

- **Display** (headings, hero): Bricolage Grotesque, weights 600/700, tight tracking (−0.02em) on large sizes.
- **Body**: Inter (variable), 400/500/600, `font-feature-settings: "ss01", "cv11"` for a cleaner look; line-height 1.6; max line length `--measure`.
- **Mono** (metadata, numbers, dev console): JetBrains Mono 400/500, uppercase labels with +0.08em tracking.
- All three are open-licensed (OFL). Self-host via `@fontsource-variable/*` packages, subset to Latin + Latin-1 (Portuguese names need diacritics: ã, ç, é), `font-display: swap`, preload only the display face used above the fold. Use `size-adjust`/metric overrides on fallbacks to keep CLS at 0.
- If Henry prefers a different voice, alternatives that fit the direction: *Space Grotesk* or *Instrument Sans* (display), *IBM Plex Mono* (mono).

## Layout & grid

- Single centered column at `--content` max width with `--gutter` padding; 12-column CSS grid inside for featured layouts.
- Cards: 16:9 media, consistent across the site. Featured grid: 2 columns ≥ 900px, 1 column below. Selected grid: 3 / 2 / 1.
- Vertical rhythm from the space scale only. Section spacing `--space-24` desktop, `--space-16` mobile.

## Components (build each as an Astro component, documented in a `/styleguide` page excluded from the sitemap)

| Component | Notes |
|---|---|
| `SiteHeader` | Sticky, 56px, blurred translucent background only if it passes contrast; becomes compact on scroll (CSS `animation-timeline` with fallback). Skip-link first. |
| `Hero` | Name (step-5), title (step-2, muted), pitch (step-1), meta line in mono, two buttons. Optional background reel. |
| `CreditsStrip` | Horizontal list of text wordmarks, muted, separated by thin dots; wraps on mobile (no marquee). |
| `ProjectCard` | Cover (Picture) + optional hover loop (video, `preload="none"`, plays on hover/focus, never on touch scroll); title, role, studio, platforms, year in mono; corner brackets on hover/focus. Whole card is one link with an accessible name. |
| `MetaList` | `<dl>` of label/value pairs in mono — the "At a glance" block. |
| `ImpactList` | Bulleted outcomes with accent markers. |
| `YouTube` | Facade (see `06`). |
| `LoopVideo` | GIF replacement (see `06`). |
| `Figure` | Responsive image with caption, optional lightbox trigger. |
| `Gallery` + `Lightbox` | Grid of thumbnails; lightbox uses native `<dialog>`, arrow keys, swipe, Esc, focus return. |
| `Timeline` | Career roles, vertical on mobile, horizontal rail on desktop. |
| `Tag` / `FilterBar` | Work index filters; works without JS as anchor links to pre-rendered filter pages, enhanced to instant filtering with JS. |
| `Button` | Primary (accent fill), secondary (outline), ghost; 44px min target. |
| `DevConsole` | Lazy-loaded overlay (see `07`). |
| `Footer` | Contact links, "Built with Astro · Source on GitHub · Last deployed <date> (<short SHA>)" in mono, "perf" chip that opens the dev console. |

## Motion

- Purposeful and quick: entrance fades of 8–12px translate, `--dur-med`, staggered ≤ 60ms, triggered once via IntersectionObserver (CSS-only `@starting-style`/scroll-driven animations where supported).
- Card hover: media scales 1.02, brackets draw in, loop starts. No bouncy springs.
- Page transitions: Astro View Transitions (cross-fade + shared element on project cover → hero) if it does not hurt Lighthouse; otherwise omit.
- `prefers-reduced-motion: reduce` → no transforms, no autoplay, instant state changes.

## Page layouts

**Home** — see `02` section list. Hero fills ~85vh on desktop, content-height on mobile (no forced full-screen on phones).

**Project (featured)** — full-bleed hero media (max 1440px) → two-column "At a glance" (MetaList left, Impact right) → long-form sections at `--measure` with media breaking out to `--content` width → gallery → next project.

**Work index** — filter bar, then featured row, then selected grid, then archive table (Title · Year · Role · Studio · Platforms · Links).

**Research** — list of papers: title, venue, year, 2-line abstract, links (PDF / DOI / video), small figure thumbnail.

**About** — portrait, story (Porto Alegre → PUCRS & HP graphics lab → Ubisoft program → CMU → Pittsburgh → Schell Games → Twin Suns → Bad Robot Games, plus Maned Wolf Games), timeline, skills grouped (Engines · Languages · Platforms · Practices), education, languages spoken (English, Portuguese, Spanish).

**Résumé** — typographic, print-first; dark/light independent (always prints black on white).

## Imagery guidance for Henry

- Prefer his own gameplay captures that show *systems in action* (combat combos, interaction, AR placement) over marketing key art.
- Hover loops: 3–5 seconds, no cuts, ≤ 1 MB after conversion.
- Portrait: natural light, neutral background, shoulders up, at least 1200px.
