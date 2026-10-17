# 02 — Content strategy

This is the research-backed backbone of the site. The design and data model exist to serve it.

## What the research says (and what we do about it)

| Finding from industry hiring guidance | Consequence for this site |
|---|---|
| Hiring managers give a portfolio a few minutes and decide within ~30 seconds whether to continue; lead with the single strongest project. | Home page leads with the hero + 3–4 featured titles. Order is curated, not chronological. |
| Recruiters and hiring managers often review on phones or slow connections. | Mobile-first layout; strict performance budgets (`07`); no autoplaying heavy media. |
| "What did *you* build?" — a clear statement of personal contribution beats a polished trailer with no attribution. | Every project has an explicit **My role** block and first-person **What I did** bullets, separate from the game description. |
| Case studies beat galleries; use a consistent structure (e.g., Problem → Role → Decisions → Outcome). | All featured projects use the same case-study template (below). |
| Show the technique in action — video or GIF next to the explanation, not visuals for their own sake. | Media is placed inline next to the paragraph it proves, with captions. |
| Recruiters are not domain experts; hiring managers want depth. Put the important summary on top. | Layered writing: plain-language summary first, technical deep dive collapsed below. |
| Quality over quantity; ~5–8 well-documented projects is the sweet spot. | Three tiers: **Featured** (5–7 full case studies), **Selected** (cards + short page), **Archive** (compact list). |
| Quantified impact (shipped titles, performance gains, adoption) differentiates; for managers, scope matters: team size, people led, delivery. | Schema has `metrics[]` and `highlights[]`; the agent asks Henry for numbers and never invents them. |
| The résumé gets the reviewer to open the portfolio; the portfolio is the proof. Keep the résumé link prominent. | Header CTA "Résumé (PDF)", generated from the same JSON so the two never disagree. |
| Consistent formatting and image sizes make portfolios easier to scan. | Fixed card aspect ratio (16:9), fixed case-study structure, design tokens. |

## Information architecture

```
/                       Home
/work/                  All work (filterable: Featured · VR/AR · Mobile · Leadership · Research · Archive)
/work/<slug>/           Project page (case study or short page, by tier)
/research/              Research & publications
/about/                 Story, career timeline, skills, education, speaking
/resume/                HTML résumé (print-perfect) + PDF download (/henry-braun-resume.pdf)
/404                    Custom, on-brand, links back to work
```

Header (sticky, compact): **Henry Braun** (home) · Work · Research · About · **Résumé** · **Contact** (mailto). On mobile: name + Résumé + menu.

## Home page, section by section

1. **Hero** — Name, title, one-line pitch, location/remote line, two buttons (View work · Download résumé). Background: a subtle, muted looping reel (≤ 1.5 MB, poster first, off under reduced motion) *or* a static key image — the agent builds both and Henry chooses.
2. **Credits strip** — text wordmarks of recognizable studios, titles, and partners: *Bad Robot Games · Among Us VR (localization tech) · I Expect You To Die · Until You Fall · HoloLAB Champions · LEGO · Google · Cartoon Network*. Text, not logos, unless Henry has rights to logos.
3. **Featured work** — 3–4 large cards (cover image; on hover/focus a short muted loop plays). Card shows title, role, studio, platforms, year, one impact line.
4. **Pillars** — three columns: Engineering leadership · Gameplay & systems · Performance on constrained hardware — each with one proof link into a case study.
5. **Selected work grid** — remaining Featured + Selected projects as smaller cards; link to /work/.
6. **Career at a glance** — compact timeline (studio, title, years) from `profile.json`.
7. **Research teaser** — 3 highlight papers (ocean waves, sky rendering, crowd visualization) → /research/.
8. **Contact** — short invitation, email, LinkedIn, GitHub, location. No form (static site; mailto is more reliable).

## Project tiers

| Tier | Count | Page | Card |
|---|---|---|---|
| `featured` | 5–7 | Full case study (template below) | Large, with hover loop |
| `selected` | 6–10 | Short page: summary, role, highlights, media | Standard |
| `archive` | rest | No page needed; row in archive table with links | Table row |

Default tiering (confirm with Henry — see `09`):

- **Featured**: Until You Fall · I Expect You To Die: Localization & Porting · HoloLAB Champions · LEGO BrickHeadz Builder VR · Domino World AR · Arithal · (Bad Robot Games work, if public)
- **Selected**: Project Octavia (Twin Suns — draft until Henry confirms what can be shown) · SuperChem VR · Orion Trail VR · Ben 10: Wrath of Psychobos · Water Bears · Toren (alpha) · Regular Show: The Great Prank War · Star Botanist
- **Archive**: Gendai Hero · As Aventuras do Avião Vermelho · Angry Pucks · Sim Camisaria · N.E.R.O.T. (GGJ 2012) · Search N' Find · Pine Creek · Loreisle
- **Research** lives on its own page; the strongest graphics papers also surface on Home.

## The case-study template (featured projects)

Every featured page uses this exact structure (headings may be visually styled, but the order is fixed):

1. **Hero** — title, one-line logline, hero video (YouTube facade) or hero image.
2. **At a glance** (definition list, scannable): Role · Studio / client · Year(s) · Platforms · Engine · Team size · Status (shipped / award) · Links (store, website).
3. **Impact** — 2–4 bullets, each starting with a strong verb, each with a number or a concrete outcome.
4. **The challenge** — 1 short paragraph: the problem and the constraints (hardware, timeline, team, scope).
5. **What I did** — first person. 3–6 bullets or short paragraphs on Henry's personal contributions and decisions, each paired with media where possible (GIF of the system in action, profiler capture, diagram).
6. **Technical deep dive** *(collapsible `<details>`, open by default on desktop)* — architecture, trade-offs, profiling approach, what he would do differently. This is where engineers spend their time.
7. **Outcome** — results, reception, awards, reuse (e.g., "the localization module was adopted by Among Us VR and Until You Fall").
8. **Gallery** — remaining images/GIFs, lightbox.
9. **Next project** — link to the next featured project (keeps reviewers moving).

Selected-tier pages use 1, 2, 3, 5 (short), 8.

## Writing rules

- **Layered**: the first sentence of every section must make sense to a recruiter; detail follows for engineers.
- **"I" vs "we"**: "we" for the team's achievement, "I" for Henry's. Never blur them.
- **Verbs**: led, managed, hired, mentored, architected, built, shipped, optimized, ported, profiled, designed, integrated.
- **Numbers or mechanisms**: if no metric exists, describe the mechanism precisely ("moved hit detection to fixed-step physics to remove frame-rate-dependent misses"). Do not invent metrics.
- **Short**: summaries ≤ 200 characters; impact bullets ≤ 25 words; challenge paragraph ≤ 80 words.
- **Names**: use official title spellings (e.g., *HoloLAB Champions*, *LEGO BrickHeadz Builder VR*, *I Expect You To Die*). Italicize game titles in prose via `<cite>` or `<i>`.
- **Clean up legacy copy**: the current site has typos ("optmization", "creatd", "throught out", "aquired") — fix them during migration.
- **No filler**: no "passionate", "rockstar", "ninja", "guru", "synergy".

### Example rewrite (from the current site)

Current:
> Worked on the gameplay, systems and optmization for this awesome VR title with a very talented team.

Target shape (numbers are placeholders the agent must get from Henry — do not publish as-is):
> **Impact**
> - Built the combo and parry systems behind Until You Fall's melee combat, tuned with design over [N] playtest rounds.
> - Optimized rendering and gameplay code to hold [72/90] fps on [Quest/PC VR] in the densest encounters.
>
> **What I did**
> - Owned [system] end-to-end: architecture, implementation, designer-facing tuning tools.
> - Profiled CPU/GPU frame time on device and [specific change] to recover [N] ms.

## SEO and sharing content

- Title pattern: `Project Title — Henry Braun` / Home: `Henry Braun — Engineering Manager, Games`.
- Meta description: the project `summary`.
- Open Graph image per project: auto-generated 1200×630 card (title, role, cover) at build.
- JSON-LD: `Person` on Home/About (name, jobTitle, sameAs links, alumniOf); `CreativeWork`/`VideoGame` with `author`/`contributor` on project pages; `VideoObject` for embedded videos.

## Résumé page and PDF

- `/resume/` renders from `profile.json` (roles with exact dates from LinkedIn) + `experiences.json` (featured + selected, grouped under the role they belong to), formatted to print on 2 US Letter pages. Lead with a 3-line leadership summary. Early roles (2009–2013) collapse into one "Earlier experience" line on the PDF.
- At build, Playwright prints `/resume/` to `/henry-braun-resume.pdf`. One source of truth; the PDF can never drift from the site.
- ATS-friendly: real text, standard headings (Experience, Skills, Education, Publications), no text in images.
