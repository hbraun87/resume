# Henry Braun Portfolio — Build Spec

Oct 17, 2026 · @Henry

## Overview

The site is Henry Braun's resume, staged as a video game loading sequence: scrolling fills a loading bar, and reaching 100% detonates the bar into a contact screen that says "LET'S BUILD THE NEXT ONE."

- **Goal:** get studio leads, recruiters and clients to reach out for engineering management, gameplay engineering or technical leadership work.
- **Audience:** game studio hiring managers, producers, recruiters, indie founders. They skim, they judge craft fast, and they recognize game UI conventions instantly.
- **The one idea:** every scroll is a loading step. The page never explains this; the HUD, stage labels, asset log and loading tips make it obvious.
- **The WOW moment:** at 100%, the screen flashes, a shockwave ring expands, a bar made of \~1,500 particles bursts and re-forms into the headline, an achievement toast pops, and a PRESS START button copies the email and announces "Player 2 has joined."

**How to use this spec:** paste the Master prompt (next section) into an AI builder for a fast first version, then use the remaining sections as the acceptance criteria. A developer can build it from the Design system, Page structure, Content data and Interaction logic sections alone.

**Reference build:** a working single-file version already exists as Henry's private Claude artifact "Henry Braun Portfolio" (HTML, CSS and vanilla JS, about 770 lines). Ask Claude for the HTML file to use as a starting codebase.

## Master prompt

Paste this whole block into Base44, Lovable, v0, Bolt or Claude. It is self-contained; attach the Content data section with it so every game and paper is included verbatim.

```text
Build a single-page portfolio/resume website for Henry Braun, Engineering Manager at Bad Robot Games and Founder of Maned Wolf Games (gameplay engineering + technical leadership, 15+ years, 20+ shipped titles, based in Pittsburgh, PA, originally from Porto Alegre, Brazil).

CORE CONCEPT
The entire page is a video game loading sequence. Scrolling = loading. A fixed loading HUD at the bottom of the screen shows a big percentage (0-100), a striped animated progress bar, the current load stage, and rotating "loading screen tips". Progress = scrollY / (documentHeight - viewportHeight). When it reaches 100%, trigger a LOAD COMPLETE finale that ends on the contact section.

VISUAL DIRECTION (dark, single theme, NOT generic neon-on-black)
- Background #0d1118 (blue-black) with a faint 48px blueprint grid, faded by a radial vignette.
- Panels #151a24, hairlines #262e3d, text warm bone #ede4d3, secondary #8e96a8.
- One accent: maned-wolf rust orange #f2793a (deep #b8501f for bar stripes).
- Platform colors used ONLY on project tags: PC #ede4d3, VR #6ec6dc, AR #e8c25c, Mobile #c79af2.
- Fonts (Google Fonts): Unbounded 800/900 for display, Instrument Sans for body, JetBrains Mono for all HUD labels, tags and logs (uppercase, letter-spacing 0.1-0.14em).
- Angular game-UI shapes: clipped corners via clip-path on cards and buttons. No rounded-corner cards, no drop-shadow cards, no emoji.

SECTIONS (in order)
1. BOOT (hero): a fake console types 4 lines with [OK]/[READY] tags (mount henry_braun.pak; origin Porto Alegre, BR -> Pittsburgh, PA; class Engineering Manager - Gameplay; assets 21 titles - 12 research projects). Then a giant name: "HENRY" solid, "BRAUN." as outlined text (transparent fill, 2px stroke) with an orange period. Tagline: Engineering Manager at Bad Robot Games. Founder of Maned Wolf Games. I build gameplay systems and lead the teams that ship them. A blinking "Scroll to load" prompt. Hero is sized to content, not 100vh.
2. STAGE 1 - PLAYER PROFILE: headline "Systems that feel great. Teams that ship." Bio on the left (Porto Alegre, PUCRS Computer Science, PUCRS/Ubisoft Game Dev specialization, master's + Visiting Scholar at CMU, moved to the US in 2013, Schell Games Senior Engineer & Tech Lead, now Bad Robot Games + Maned Wolf Games). On the right a "Character sheet" card: 4 stat tiles (15+ years in games, 20+ shipped titles, 4 platforms, 12 R&D projects), attributes (Class, Origin, Base, Guilds) and a "Skill tree" of tags. Below, a 3-column "quest log": Active quests / Completed / Training.
3. STAGE 2 - LEVEL SELECT: "Shipped titles" grid of 21 game cards with filter buttons (All / PC / VR / AR / Mobile, each with a count). Each card: an art band tinted with its platform color, a big outlined initials glyph, a platform chip, role in mono caps, title, 1-2 sentence description. Hover: lift 4px, border turns platform color, a scan-line sweeps down the art band. Arithal and Until You Fall are featured cards spanning 2 columns.
4. STAGE 3 - R&D LAB: "Research" list of 12 projects in two columns, each row = category tag (orange mono), title, one-line description, arrow; rows link to henrybraun.info/research/<slug>.html.
5. STAGE 4 - FINALE: a framed canvas stage with corner labels (henry_braun.pak / live % / "Move the cursor over the text" / Build 2026.10). Below it: "Your project is next in the queue.", the email hbraun87@gmail.com as selectable text with a Copy button, links to Email, LinkedIn (linkedin.com/in/henrybraun) and henrybraun.info, and a big orange clipped-corner PRESS START button.

LOADING HUD DETAILS
- Stage label changes with the section in view: "Booting player profile", "Loading character sheet", "Streaming levels (N/21)" (N = game cards scrolled into view), "Compiling research shaders", then "Load complete".
- Rotating tip every 6.5s with a fade (e.g. "TIP: N.E.R.O.T. went from zero to playable in one Global Game Jam weekend.").
- Desktop only: a small right-aligned "asset stream" log above the HUD; each card/row/section that enters the viewport logs a line like "levels/until_you_fall.lvl 4.2MB" or "shaders/webcam_3d_scanner.glsl OK"; keep the last 6, older ones dimmed.
- The percentage eases toward the real value (lerp 0.18 per frame).
- Once 100% is reached it locks: HUD turns solid orange, the right-side button reads "Press start" and pulses.

FINALE (the WOW)
- Canvas: sample the headline text "LET'S BUILD / THE NEXT ONE." (Unbounded 900, 4 lines on narrow screens) into ~1,500 points. Before completion, those points sit as a giant particle loading bar in the middle of the canvas, lit orange up to the current %, dim grey after it, gently jittering, labeled "LOADING NEXT PROJECT".
- At 100%: white screen flash (0.5s), the stage shakes, an orange shockwave ring expands, particles burst outward with gravity for ~420ms, then spring into the headline letters (mostly bone, ~28% orange). The mouse repels particles within a 90px radius. Show an achievement toast: "Achievement unlocked - Completionist - Loaded 100% of Henry Braun. Next up: your project."
- PRESS START copies the email (with a select-text fallback), re-bursts the particles and shows a toast: "Player 2 has joined - Email copied to clipboard".
- Easter egg: the Konami code (up up down down left right left right B A) toggles a rainbow "party mode" for the particles.

REQUIREMENTS
- Fully responsive down to 375px: grids collapse to 1 column, nav hides, asset log hides, HUD stays.
- Respect prefers-reduced-motion: no typing, flash, shake or stripes animation; particles snap into place.
- Visible keyboard focus, semantic headings, aria-hidden on decorative canvas with a visually hidden h2 carrying the headline, progressbar role on the HUD bar.
- Only animate the canvas while it is on screen (IntersectionObserver). Cap devicePixelRatio at 2.
- No lorem ipsum: use the provided content exactly.
```

## Design system

The look is a game studio's dev console at night: blue-black blueprint grid, warm bone text, and one rust-orange accent taken from the maned wolf (Henry's studio mascot).

### Color tokens

| Token | Hex | Use |
| --- | --- | --- |
| `--ink` | #0d1118 | Page background |
| `--panel` | #151a24 | Cards, HUD track, raised surfaces |
| `--line` | #262e3d | Hairlines, borders, background grid |
| `--bone` | #ede4d3 | Primary text, PC tag |
| `--dim` | #8e96a8 | Secondary text, labels |
| `--wolf` | #f2793a | The only accent: progress, CTAs, highlights |
| `--wolf-deep` | #b8501f | Second stripe in the progress bar |
| `--vr` | #6ec6dc | VR platform tag and card tint |
| `--ar` | #e8c25c | AR platform tag and card tint |
| `--mobile` | #c79af2 | Mobile platform tag and card tint |

Rules: orange appears only on things tied to progress or action. Platform colors appear only on project cards and filters. Body copy on dark panels uses a slightly dimmer bone (#c9c2b4) for long paragraphs.

### Typography

| Role | Font | Settings |
| --- | --- | --- |
| Display (name, headings, %, stats) | Unbounded | 800-900, uppercase, letter-spacing -0.01 to -0.035em |
| Body | Instrument Sans | 400/600, 17px base, line-height 1.6, max 62ch |
| HUD, tags, logs, labels | JetBrains Mono | 11-13px, uppercase, letter-spacing 0.1-0.14em |

Scale: hero name clamp(54px, 13.5vw, 184px) · h2 clamp(30px, 5.2vw, 64px) · card titles 17px · labels 11-12px. Use `text-wrap: balance` on headings and `font-variant-numeric: tabular-nums` on every number that changes.

### Surfaces and shapes

- **Background:** two 1px linear-gradient grids at 48px, `background-attachment: fixed`, under a radial vignette so the grid fades toward the edges.
- **Clipped corners** are the signature shape: `clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)` on the character sheet; both opposite corners clipped on PRESS START.
- **Outlined text:** `color: transparent; -webkit-text-stroke: 2px var(--bone)` for "BRAUN." and the card glyphs.
- **Grids of tiles** use the 1px-gap trick: a `--line` background with `gap: 1px`, so dividers are perfectly even.
- No rounded cards, no soft shadows, no gradients except the card art tints and vignette.

### Motion rules

- One orchestrated moment (the finale). Everything else is small: typing console, blinking caret, striped bar, card hover lift and scan sweep.
- Easing: UI 0.2-0.25s ease; toast enters with an overshoot `cubic-bezier(.2,1.4,.4,1)`.
- Under `prefers-reduced-motion`, turn off typing, blinking, stripes, flash, shake and smooth scroll; particles snap to the text.

## Page structure

The page is one scroll with five sections plus two fixed layers (top bar and loading HUD). Each section carries a `data-stage` attribute that feeds the HUD label.

### Fixed layers

- **Top bar** (sticky, blurred translucent ink): "HB" clipped-square logo + HENRY BRAUN on the left; nav Profile · Games · R&D · Contact in mono caps on the right. The link for the section in view turns bone with an orange ▸. Nav hides under 720px.
- **Loading HUD** (fixed bottom, 64px + safe-area): big % in Unbounded · stage label + tip above a 10px striped bar · "Loading…" / "Press start ▸" button linking to the finale. Body gets bottom padding equal to the HUD height so nothing hides behind it.

### Sections

1. **Boot (hero)** — `data-stage="Booting player profile"`
   - Console types four lines at \~2 characters per 14ms, 130ms pause between lines, each ending in an orange `[OK]` or `[READY]`, then a blinking orange block caret.
   - Name on two lines: HENRY (solid) / BRAUN. (outlined, orange period), line-height 0.86.
   - Row under the name: tagline left (Bad Robot Games and Maned Wolf Games in orange), "Scroll to load ▾" + "Pittsburgh, PA" right.
2. **Stage 1 · Player profile** — `data-stage="Loading character sheet"`
   - Stage header pattern used by every section: mono caps "**Stage 1** Player profile" with a hairline running to the right edge.
   - Headline: Systems that feel great. Teams that ship.
   - Two columns (1.15fr / 1fr, stacks under 860px): four-paragraph bio, and the Character sheet card (stat tiles, attributes list, skill tree tags).
   - Quest log, three columns: **Active quests** (Engineering Manager · Bad Robot Games; Founder · Maned Wolf Games, shipped Arithal), **Completed** (Senior Engineer & Tech Lead · Schell Games, from 2013; Programmer · Aquiris Game Studio, Ben 10 and Regular Show), **Training** (B.S. Computer Science · PUCRS; Game Development Specialization · PUCRS/Ubisoft; Master's · Visiting Scholar · Carnegie Mellon University). Active quests get an orange glowing square marker.
3. **Stage 2 · Level select** — `data-stage="Streaming levels"`
   - Header row: "Shipped titles" + lede left, platform filter buttons right (pressed state = bone fill, ink text).
   - Grid: `repeat(auto-fill, minmax(min(100%, 272px), 1fr))`, gap 16px. Featured cards span two columns with a taller art band and the first word of the title as the glyph.
4. **Stage 3 · R&D lab** — `data-stage="Compiling research shaders"`
   - "Research" + lede, then a two-column list with hairline dividers. Each row: 112px category column, title + description, arrow that slides 4px right on hover.
5. **Stage 4 · Finale** — `data-stage="Finalizing"`
   - Stage header reads "Waiting for load…" until 100%, then "Load complete".
   - Framed canvas, height clamp(300px, 54vh, 540px), with four corner labels.
   - Contact row: headline, lede, email + Copy, link buttons; PRESS START on the right (stacks under 760px).

### Copy for the profile and contact

- **Bio 1:** Born in Porto Alegre, Brazil, home of chimarrão, churrasco and the Gaúchos. Now building games in Pittsburgh.
- **Bio 2:** I studied Computer Science at PUCRS, then took the PUCRS/Ubisoft Game Development specialization, and later completed my master's work with a Visiting Scholar stint at Carnegie Mellon University.
- **Bio 3:** I moved to the United States in 2013 and joined Schell Games, where I spent years as a Senior Engineer and Tech Lead across a wide range of shipped titles in VR, AR, mobile and PC. Today I'm an Engineering Manager at Bad Robot Games and the founder of Maned Wolf Games.
- **Bio 4:** My work sits where creative vision meets technical execution: gameplay engineering, technical leadership, and the pipelines that let a team move fast without breaking the game.
- **Skill tree:** Gameplay systems · Technical leadership · VR / AR · Optimization · Localization & porting · Procedural generation · Real-time rendering · Computer vision · Unity
- **Contact headline:** Your project is next in the queue.
- **Contact lede:** Hiring for gameplay engineering or technical leadership, or have a game that needs to ship? Send me a message.
- **Contact details:** hbraun87@gmail.com · [LinkedIn](https://www.linkedin.com/in/henrybraun/) · [henrybraun.info](https://henrybraun.info)

## Content data

All 21 games and 12 research projects come from Henry's Base44 portfolio; descriptions are tightened to two sentences or fewer for the cards. Order is the display order.

### Games (21)

| Title | Platform | Role | Card description | Featured |
| --- | --- | --- | --- | --- |
| Arithal | PC | Co-founder | A classic adventure game with turn-based battles, set in a dark-but-whimsical world after a devastating flood called The Drowning. The first release from Maned Wolf Games. | Yes |
| Until You Fall | VR | Tech lead | Gameplay, systems and optimization for a VR sword-fighting game that fuses melee and magic so players build their own martial style. | Yes |
| I Expect You To Die: Localization | VR | Project director | Directed the localization and porting of the award-winning title. Its cloud-driven modular pipeline was reused in Among Us VR and Until You Fall. |  |
| HoloLAB Champions | VR | Tech director | A VR chemistry game show where players run real lab procedures to become Champion of lab practice. Released in 2018 and won several awards. |  |
| Toren | PC | Engineer | Worked with Swordtales on the alpha targeting the OnLive platform. A solitary journey to find your purpose in a timeless world. |  |
| SuperChem VR | VR | Tech director | Proof of concept for real chemistry in VR: measure and mix reactants to create a glowing reaction, with a robot assistant. |  |
| Domino World AR | AR | Project director | Built with Google. Lay virtual domino courses in the room around you with tiles, props and toys, on ARKit and ARCore. |  |
| LEGO Brickheadz VR | VR | Tech director | LEGO x Schell Games VR sandbox for building characters. Named one of the best Daydream apps by TechRadar, VRScout and The Verge. |  |
| Ben 10: Wrath of Psychobos | Mobile | Programmer | Made at Aquiris Game Studio for iOS and Android. Alien powers and Proto-Tool weapons against waves of enemies and bosses. |  |
| Regular Show: The Great Prank War | Mobile | Programmer | Cartoon Network tower defense game. Built the prototype at Aquiris Game Studio. |  |
| Orion Trail VR | VR | Gameplay engineer | First VR title shipped with Schell Games, on the Gear VR store. Optimization and gameplay for a comedic sci-fi adventure. |  |
| Water Bears | Mobile | Engineer | First project at Schell Games: a 3D mobile puzzle game about rehydrating sad water bears. Localization and porting to iOS and Android. |  |
| Gendai Hero | Mobile | Programmer | A 2D samurai sushi-chef platformer built in Unity with Luiz Alvarez (Toren), for iOS and Android. |  |
| As Aventuras do Avião Vermelho | PC | Programmer | Adapted from Erico Verissimo's 1936 book. Built in two months in Unity as the PUCRS/Ubisoft specialization final project. |  |
| Star Botanist: Garden Planet | Mobile | Gameplay engineer | Systems and gameplay for a colorful vertical platformer set on an alien planet. |  |
| Angry Pucks | Mobile | Developer | A fast, casual ice hockey game for iOS and Android built around leaderboard competition. A hobby project. |  |
| Sim Camisaria | PC | Programmer | Freelance at Rockhead Games: a factory management game with 10 goal-driven levels. |  |
| N.E.R.O.T. | PC | Developer | Never Ending Runner Out of Time. A bionic samurai runner on a procedural infinite world, made at Global Game Jam 2012. |  |
| Search N' Find | Mobile | Engineer | Hidden-object game first made for kiosks by Electric Owl Studios, ported to mobile by SD Technologies. |  |
| Pine Creek | PC | Developer | A 3D puzzle horror game in development. Harrison Goodwin wakes after an accident in a strange little Pennsylvania town. |  |
| Loreisle | PC | Developer | A multiplayer turn-based tactics game inspired by Vandal Hearts. A hobby project in active development. |  |

Platform counts for the filter buttons: All 21 · PC 7 · VR 6 · AR 1 · Mobile 7.

### Research (12)

Each row links to `https://henrybraun.info/research/<slug>.html`.

| Category | Title | One-line description | Slug |
| --- | --- | --- | --- |
| Software | Phlipits | Rotoscoping and compositing made simple, for short animated videos in education. Built with SD Technologies. | phlipits |
| Framework | CrowdVis | Real-time visualization of pre-computed crowd simulations and virtual humans. | crowdvis |
| Survey · CMU ETC | VRoom 360 | An interactive survey of vehicle roominess and visibility for General Motors. | vroom360 |
| Procedural anim. | Making Them Alive | From posture detection and body segmentation to an animatable 3D virtual human. | makingthemalive |
| Procedural model | Real-Time Breaking Waves | Breaking ocean waves from a few parameters at minimal CPU and GPU cost. | breakingwaves |
| Platform | VhCVE | A collaborative virtual environment with voice, vision tools, physics and avatar animation. | vhcve |
| Procedural model | Cartoon 2D Cracks | Real-time cracks for games, generated from leaf venation patterns. | cracks |
| Rendering | Large Scale Terrain Rendering | An analysis of real-time terrain approaches and a proposal for large scenes. | lstr |
| Procedural model | Real-Time Sky Rendering | A lightweight sky model with day and night cycles for outdoor games. | skyrendering |
| Computer vision | Webcam 3D Scanner | A line laser and a webcam reconstruct object geometry into a 3D mesh. | 3dscanner |
| Application | VHuP: Virtual Humans Player | Playback and post-processing of virtual human simulations with lights and weather. | vhup |
| Simulation | Solar System Simulator | Tweak mass, radius and speed of celestial bodies and watch the orbits respond. | solarsystem |

### Loading-screen tips (rotate every 6.5s)

- TIP: The I Expect You To Die localization pipeline later shipped in Among Us VR.
- TIP: LEGO Brickheadz VR was called one of the best Daydream apps by The Verge.
- TIP: N.E.R.O.T. went from zero to playable in one Global Game Jam weekend.
- TIP: Domino World AR was built with Google and shipped on ARKit and ARCore.
- TIP: Avião Vermelho was built in two months, start to finish, in Unity.
- TIP: HoloLAB Champions turns real lab procedure into a VR game show.
- TIP: Gaúchos take their chimarrão seriously. Henry does too.

## Interaction logic

Everything runs on two loops: a passive scroll handler that computes the real progress, and one `requestAnimationFrame` loop that eases the displayed value and draws the canvas.

### 1. Scroll progress and HUD

```javascript
let maxScroll = 1, progress = 0, shown = 0, done = false, streamed = 0;

function measure() {            // on load, resize, fonts.ready, and after filtering cards
  maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  onScroll();
}
function onScroll() {
  progress = Math.min(1, Math.max(0, scrollY / maxScroll));
  if (progress > 0.995 && !done) complete();
  // current section = last one whose top is above 45% of the viewport
  const mid = scrollY + innerHeight * 0.45;
  let cur = sections[0];
  for (const s of sections) if (s.offsetTop <= mid) cur = s;
  if (!done) stageTxt.textContent = cur.id === 'levels'
    ? `Streaming levels (${streamed}/21)` : cur.dataset.stage;
}
function render() {             // every frame
  const target = done ? 1 : progress;
  shown += (target - shown) * (reduceMotion ? 1 : 0.18);
  pct.textContent = Math.round(shown * 100);
  fill.style.width = (shown * 100) + '%';
  requestAnimationFrame(render);
}
```

- Use the 0.995 threshold, not exactly 1: sub-pixel rounding and mobile address bars can stop scrollY a pixel short.
- Call `measure()` again whenever the page height changes (filter buttons hide cards).
- Declare all state before the first `measure()` call; calling it early on a page restored at the bottom will otherwise hit uninitialized variables.

### 2. Asset stream log

One `IntersectionObserver` (threshold 0.35) watches every game card, research row and section. On first intersection, unobserve and log:

- game card → `levels/<slug>.lvl` + a random size 1.0-9.9MB, and `streamed++`
- research row → `shaders/<slug>.glsl OK`
- section → `stage/<id>.bundle LOADED`

Keep the last 6 lines; lines older than the newest 3 sit at 35% opacity. Hidden under 1100px.

### 3. Finale particle effect

**Sample the text.** Draw the headline on an offscreen canvas the size of the stage, read `getImageData`, and keep every pixel on a grid step where alpha > 128.

```javascript
const lines = W < 560 ? ["LET'S", 'BUILD', 'THE NEXT', 'ONE.'] : ["LET'S BUILD", 'THE NEXT ONE.'];
// fit: font size = min(widthFit at 86% of W, heightFit at 74% of H)
const step = Math.max(3, Math.round(Math.sqrt(W * H / 5200)));   // ~1,500 particles at any size
for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step)
  if (alpha(x, y) > 128) pts.push([x, y]);
pts.sort((a, b) => a[0] - b[0]);   // left-to-right, so the bar's left end becomes the text's left side
```

Wait for `document.fonts.ready` before sampling, or the canvas draws the fallback font.

**Three phases.**

| Phase | Each particle | Duration |
| --- | --- | --- |
| bar | Sits at its home slot in a bar 78% of the stage wide (max 760px), centered; index/N ≤ shown → orange, else grey at 16% alpha; tiny sine jitter | Until 100% |
| burst | Random direction, speed 6-22, extra -4 upward; velocity × 0.9 per frame, gravity +0.25 | 420ms |
| form | Spring to target: v += (target − p) × 0.06, v × 0.82; mouse within 90px pushes away with force (90 − d)/90 × 6 | Forever |

Particle size is 0.62 × step, drawn with `fillRect`. In form, \~72% are bone, \~28% orange (random per particle, fixed). Party mode colors each by `hsl((x/W × 360 + t × 120) % 360, 85%, 62%)`.

**Shockwave ring:** on burst, a 3px orange circle from the stage center; radius grows by 3.5% of the larger stage side per frame, alpha × 0.93 per frame, removed under 0.02.

Only draw while the canvas intersects the viewport, and rebuild targets on resize (debounced 150ms). If the finale has already formed, new targets snap into place.

### 4. complete()

Runs once. In order:

1. Set `done = true`; HUD gets the `done` class (solid orange bar, orange %, pulsing "Press start ▸" button).
2. Stage labels switch to "Load complete"; log `henry_braun.pak 100%`.
3. After 350ms: start the burst, flash the screen (bone overlay 55% → 0 over 0.5s), shake the stage (0.45s, ±6px), show the Completionist toast for 4.2s.

The HUD stays at 100% if the visitor scrolls back up.

### 5. PRESS START and Copy

- Call `navigator.clipboard.writeText` inside the click handler. If it rejects, select the email text node and change the button label to "Selected, press ⌘C". Reset the label after 2.2s.
- PRESS START: copy, then if the load is not complete run `complete()`; otherwise re-burst the formed particles and ring. Toast: small text "Player 2 has joined", title "Email copied to clipboard" (or "Email selected"), sub "hbraun87@gmail.com · paste it into your mail app and say hi."
- Keep a plain `mailto:` link too, but never claim an email was sent.

### 6. Konami code

Track keydown against ↑ ↑ ↓ ↓ ← → ← → B A. On match: toggle party mode, run `complete()` if needed, scroll to the finale, toast "Secret found · Party mode on / off · Old cheat codes never die." Show the sequence in the footer as a hint.

## Quality requirements

The site must feel as good on a recruiter's phone as on a studio lead's 27-inch monitor, and pass a keyboard-only and reduced-motion check.

### Responsive breakpoints

| Width | Changes |
| --- | --- |
| ≤ 1100px | Asset stream log hidden |
| ≤ 860px | Profile and quest log stack to one column |
| ≤ 760px | HUD tip hidden; contact row stacks; research list one column |
| ≤ 720px | Top nav hidden |
| ≤ 640px | Hero row stacks |
| ≤ 620px | Featured cards stop spanning two columns |
| ≤ 560px (canvas width) | Headline splits into 4 lines |
| ≤ 480px | HUD "Press start" button hidden; research category moves above the title |

Side gutters: `max(16px, env(safe-area-inset-left/right))`. The HUD and sticky header add the matching `env(safe-area-inset-*)` padding. No horizontal scroll at 375px.

### Accessibility

- One h1 (the name), an h2 per section, h3 for cards.
- HUD bar: `role="progressbar"` with `aria-valuenow` updated every frame it changes.
- Canvas: `aria-hidden="true"`, with a visually hidden h2 "Load complete. Let's build the next one."
- Toasts in a `role="status" aria-live="polite"` region.
- Filter buttons use `aria-pressed`.
- 2px orange `:focus-visible` outline with 3px offset on everything interactive.
- Contrast: bone on ink is \~14:1, dim on ink \~6:1, ink on orange \~6.8:1.
- `prefers-reduced-motion`: see Motion rules. The console prints instantly, the percentage jumps without easing.

### Performance budget

- Lighthouse performance ≥ 90 on mobile.
- No images required; card art is CSS gradients plus outlined text. When real screenshots are added, serve WebP/AVIF at 2 sizes with `loading="lazy"`.
- Three font families, `display=swap`, with system fallbacks (Arial Black, Helvetica, Menlo).
- Canvas: devicePixelRatio capped at 2, paused when off screen, step size scales so particle count stays \~1,500.
- Scroll listener is passive; all DOM writes happen in the rAF loop.

## Upgrades for a better version

The biggest single improvement is real project art: the cards work without it, but screenshots and short gameplay clips are what studio leads look for first. The rest are ranked by impact for the effort.

| Upgrade | What it adds | Effort |
| --- | --- | --- |
| Real key art on every card | Replace the outlined-initials art band with each game's key art or a screenshot; keep the platform tint as a 30% overlay so the grid still reads as one set | Low |
| Level detail overlay | Clicking a card opens a full-screen "level briefing": hero image or trailer link, role, team size, platform, year, what Henry built, store links. Deep-link with `#arithal` | Medium |
| Year and filters by role | Add a year to each game, sort newest first, and filter by role (Director, Lead, Engineer) as well as platform | Low |
| Downloadable resume | A "Save file" button in the profile that downloads a one-page PDF resume | Low |
| Sound design | Off by default; a speaker toggle in the HUD enables soft UI blips on hover, a rising tone as the bar fills, and a chord at LOAD COMPLETE (Web Audio API, no files needed) | Medium |
| Testimonials as "party members" | 3 short quotes from former leads or teammates, shown as character portraits with a class (Producer, Art Director) | Low (content), Low (build) |
| Maned wolf mascot | A small pixel or low-poly maned wolf that runs along the progress bar and howls at 100% | Medium |
| 3D finale | Rebuild the particle headline in Three.js with depth and camera parallax on mouse move; fall back to 2D canvas on low-end devices | High |
| Gamepad support | Gamepad API: the stick scrolls the page, A presses START, so a visitor with a controller plugged in can "play" the site | Medium |
| Real contact form | A short form (name, studio, what you're building) that posts to Formspree or a serverless function, with an inline "Message sent" state | Low |
| Analytics events | Track % reached, finale reached, PRESS START, copy email, LinkedIn clicks, so Henry knows how far recruiters actually scroll | Low |
| Portuguese toggle | EN / PT-BR switch, a nod to Porto Alegre and useful for Brazilian studios | Medium |

Avoid adding a fake "Continue / New Game" splash before the page: it delays the content and recruiters bounce. The loading metaphor should never block reading.

## Build and launch

Recommended path: keep it as plain HTML, CSS and vanilla JavaScript, host it free on Cloudflare Pages or Netlify, and point henrybraun.info at it.

### Stack options

| Option | Best when | Notes |
| --- | --- | --- |
| Single HTML file, vanilla JS (recommended) | You want it fast, cheap and easy to edit | The reference build is already this. No build step; edit the `games` and `research` arrays to update content |
| Astro + content collections | You add the level detail pages | Each game becomes a Markdown file with frontmatter (title, platform, role, year, images); still ships almost no JS |
| Next.js / React | You add a CMS, forms and analytics in one app | Heavier; put the canvas finale in a client component |
| Base44 / Lovable | You prefer prompting over code | Use the Master prompt, then check every item in Quality requirements; AI builders often drop reduced-motion and the 0.995 threshold |

### Suggested file layout (if you split the single file)

```text
/index.html
/css/tokens.css      color + type tokens
/css/site.css        layout, sections, HUD, cards
/js/data.js          games, research, tips
/js/hud.js           scroll progress, stage label, tips, asset log
/js/finale.js        particle canvas, complete(), toasts
/js/extras.js        copy email, PRESS START, Konami
/img/games/<slug>.webp
/resume/henry-braun-resume.pdf
```

### Hosting and domain

1. Put the files in a GitHub repository.
2. Connect it to Cloudflare Pages, Netlify or Vercel (all free for a static site); every push redeploys.
3. Add henrybraun.info as a custom domain and update its DNS records as the host instructs. HTTPS is automatic.
4. Keep the existing `/research/*.html` pages live (or move them into the new repo) so the R&D links keep working.
5. Redirect the old Base44 URL to the new domain, or unpublish it, so there is one canonical portfolio.

### Launch checklist

- [ ] All 21 games and 12 research entries present and spelled correctly
- [ ] Email copies on desktop Chrome, Safari, Firefox and iOS Safari
- [ ] Scrolling to the bottom reaches 100% on a phone with the address bar showing and hidden
- [ ] Finale bursts and forms; mouse repulsion works; text fits at 375px and 2560px
- [ ] Reduced-motion setting turned on: no flash, shake or typing; content still complete
- [ ] Keyboard only: every link, filter and button reachable with visible focus
- [ ] No horizontal scroll at 375px
- [ ] Open Graph title, description and a 1200×630 share image (the finale headline on the grid background works well)
- [ ] Favicon (the orange clipped HB square)
- [ ] Lighthouse mobile performance ≥ 90 and accessibility ≥ 95
- [ ] LinkedIn and henrybraun.info links open in a new tab
- [ ] Analytics installed, if used
