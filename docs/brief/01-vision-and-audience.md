# 01 — Vision and audience

## One-sentence vision

A fast, elegant, cinematic portfolio that makes a game studio's hiring lead think, within thirty seconds, *"This is an engineering manager who came up through gameplay engineering, has led and shipped award-winning VR/AR and mobile titles — and the site itself proves he sweats the details."*

## Who Henry is (positioning)

Draw only from verified facts (see `09-migration-inventory.md`; sources are henrybraun.info and Henry's LinkedIn export, Oct 2026). The raw material:

- **17 years in games and real-time graphics** (2009 → today): Hewlett-Packard PUCRS graphics lab → Carnegie Mellon → Pittsburgh.
- **Engineering Manager at Bad Robot Games** (since June 2026), promoted from **Lead Gameplay Engineer** (Jan 2024 – Jun 2026). Confirm with Henry what Bad Robot work can be shown publicly.
- **Senior Programmer at Twin Suns Corp** (2021–2024) on *Project Octavia*, a PvPvE Unreal Engine title.
- **Six and a half years at Schell Games** (2015–2021, Advanced → Senior Engineer), technical leadership on shipped, recognized VR/AR titles: Tech Director on HoloLAB Champions (award-winning, 2018), LEGO BrickHeadz Builder VR (Google Daydream), SuperChem VR; Project Director on Domino World AR (with Google); Project Director & Tech Lead on *I Expect You To Die* localization and porting — whose localization module was later used in **Among Us VR** and **Until You Fall**. Gameplay, systems, and optimization on Until You Fall and Orion Trail VR (Gear VR store launch).
- **Founder of Maned Wolf Games** (since April 2021), developing *Arithal*.
- **Earlier**: Co-Director of Interactive Media Initiatives (Vissman Management, 2013–2015); Toren alpha (Swordtales, released on OnLive); Ben 10 and Regular Show for Cartoon Network (Aquiris); VRoom 360 for General Motors at CMU's ETC.
- **Research depth in real-time graphics and virtual humans**: publications including CrowdVis, VHuP, Mise en Scène, procedural cartoon cracks, and procedural modeling of virtual-agent groups; work on ocean waves, sky, and terrain rendering. M.Sc. in Computer Graphics (PUCRS, visiting scholar at CMU), PUCRS/Ubisoft game development specialization.
- **Languages**: English (full professional), Portuguese (native), Spanish (limited working).

### Positioning statement (default — confirm wording with Henry)

> **Engineering manager, games.** I lead game engineering teams and build the systems that make games feel great — from VR combat to cross-platform gameplay, on hardware that forgives nothing. Engineering Manager at Bad Robot Games; previously Schell Games and Twin Suns; founder of Maned Wolf Games.

The site must serve two readers at once: studios hiring an **engineering manager / engineering leader**, and engineers who want proof he is still deeply technical. Leadership leads; technical depth backs it up.

Three pillars the whole site reinforces:

1. **Engineering leadership** — managing and growing teams, tech and project direction, tools and modules adopted across a studio's projects.
2. **Gameplay & systems** — feel, combat, interaction, tools.
3. **Performance on constrained hardware** — VR frame budgets, mobile, porting, cross-platform development.

## Audiences, in priority order

| Audience | Time they give | What they must find | Where |
|---|---|---|---|
| **Studio recruiter / talent partner** (often on a phone, often non-technical) | 30–60 s | Name, current title, seniority, recognizable shipped titles, location / remote status, resume PDF, email | Home hero, credits strip, header CTA |
| **Hiring manager / engineering director / studio head** | 3–5 min | Scope of leadership (team size, reports, delivery), what *Henry personally* built or led, results; evidence (video) | Featured case studies, About, résumé |
| **Peer engineers on the interview loop** | 5–15 min, before interviews | Depth: architecture, trade-offs, profiling, code or talks | Case-study "Technical deep dive" sections, research |
| **Founders / producers / clients** (contract or co-dev work) | 1–3 min | Range, reliability, platforms, contact | Home, "Work" index filters, contact |

Industry sources consistently report that hiring managers spend only a few minutes per portfolio and decide in roughly the first 30 seconds whether to keep scrolling — so the strongest work goes first, and nothing important is more than one click away.

## What every visitor must be able to answer

On the home page, without scrolling past the second screen on mobile:

1. Who is this? → name, title, one-line pitch, location/remote.
2. Can he ship? → recognizable credits strip + 3–4 featured titles with video-backed cards.
3. What does he do best? → the three pillars.
4. How do I reach him? → email and résumé buttons, always visible in the header.

On any featured project page, above the fold:

1. What is the game? (one line + hero video)
2. What was Henry's role? (title, team size, people led, duration, platforms, engine)
3. What did he personally deliver, and what changed because of it? (2–4 impact bullets)

## Tone

Confident, precise, warm. A senior engineer explaining his work to a respected peer — no hype, no buzzword soup, no false modesty. A touch of personality is welcome (the Gaúcho-to-Pittsburgh story, Maned Wolf Games), placed in the About page, not the hero.

## Signals of technical excellence (the site *is* the demo)

- Instant: sub-second loads on mid-range phones; no layout shift; no jank on scroll.
- Precise typography, alignment, and spacing on every breakpoint.
- Video that loads only when asked and starts immediately when it is.
- Perfect accessibility and semantics; works with keyboard and screen readers.
- A hidden-in-plain-sight **dev console** (press <kbd>~</kbd>, or the small "perf" chip in the footer) that overlays the page's real Web Vitals, JS weight, and build info — a nod to in-game debug HUDs that game engineers instantly recognize.
- Open source: the repository is public and clean — a hiring engineer who clicks "View source" sees a tidy, tested, documented codebase. The README of the repo is part of the portfolio.

## Non-goals

- Not a blog (can be added later; schema leaves room).
- Not a WebGL showpiece that costs load time. Any 3D/shader flourish must be optional, lazy, off under reduced motion, and must not affect Lighthouse scores.
- Not a list of every task ever done. Curate.
