# 09 — Migration inventory (henrybraun.info + LinkedIn export, Oct 17, 2026)

The current site has three pages (About `/index.html`, Projects `/projects.html`, Research `/research.html`) and one detail page per project at `/projects/<legacy>.html`. Copyright footers range from 2019 to 2022, so recent work (2022 → today) is likely missing.

## Profile facts (LinkedIn export, Oct 2026 — authoritative for titles and dates)

| Dates | Company | Title |
|---|---|---|
| Jun 2026 – present | Bad Robot Games | **Engineering Manager** |
| Jan 2024 – Jun 2026 | Bad Robot Games | Lead Gameplay Engineer |
| Apr 2021 – present | Maned Wolf Games | Founder (Pittsburgh) |
| Oct 2022 – Jan 2024 | Twin Suns Corp | Senior Programmer — Project Octavia, PvPvE, Unreal Engine |
| Oct 2021 – Oct 2022 | Twin Suns Corp | Programmer |
| Aug 2020 – Oct 2021 | Schell Games | Senior Engineer (Pittsburgh) |
| Apr 2015 – Aug 2020 | Schell Games | Advanced Engineer (Pittsburgh) |
| Sep 2013 – Apr 2015 | Vissman Management, LLC | Co-Director of Interactive Media Initiatives |
| Jul 2013 – Aug 2013 | Aquiris Game Studio | Programmer (Porto Alegre) |
| Apr 2013 – May 2013 | Rockhead Games | Programmer, freelance (Sim Camisaria) |
| Aug 2011 – Mar 2012 | Swordtales | Programmer — part of the Toren alpha released on OnLive |
| Jul 2011 – Dec 2011 | Carnegie Mellon University (ETC) | VRoom 360 — C++, iOS |
| Mar 2009 – Jul 2011 | Hewlett-Packard PUCRS Laboratory | R&D Engineer, computer graphics |

- **Education (PUCRS):** M.Sc. Computer Graphics 2010–2012 (visiting scholar at CMU) · Game Development specialization (PUCRS/Ubisoft) 2010–2011 · B.Sc. Computer Science 2005–2009.
- **Languages:** English (full professional), Portuguese (native), Spanish (limited working).
- **LinkedIn top skills:** Technical Leadership, Communication, Cross-platform Development.
- **Contact for the site:** Pittsburgh, PA · hbraun87@gmail.com · linkedin.com/in/hbraun87 · github.com/hbraun87. The LinkedIn export also contains a phone number — **never publish it**.
- **Domain:** Henry will point `henrybraun.info` at GitHub Pages himself (Option A in `04`).
- Portrait: `https://henrybraun.info/img/henry.png`.
- Corrections to the old About page: Schell Games started in **2015** (not 2013); Henry is the sole **Founder** of Maned Wolf Games; the 2013 role was at Vissman Management.

## Projects (21) — legacy path → new id, default tier

Media patterns on the current site: cover `/img/projs/<legacy>.png`; gallery `/img/<legacy>/<n>.png` (thumbnails `<n>_thumb.png` — migrate the full-size files only); YouTube via `/embed/<id>`.

| # | Title | Legacy page | New `id` | Tier | Role (current site) | Studio / client | Known media |
|---|---|---|---|---|---|---|---|
| 1 | Arithal | arithal.html | `arithal` | featured | Founder | Maned Wolf Games | "Trailer coming soon" — none yet |
| 2 | Until You Fall | untilyoufall.html | `until-you-fall` | featured | Gameplay, systems, optimization | Schell Games | YouTube `S1zZHy7_BFg`; 6 images `/img/untilyoufall/1–6.png` |
| 3 | I Expect You To Die: Localization | ieytd.html | `i-expect-you-to-die-localization` | featured | Project Director & Tech Lead | Schell Games | YouTube `BbTIdBKVmeI`; 1 image |
| 4 | HoloLAB Champions | hololab.html | `hololab-champions` | featured | Tech Director | Schell Games | check page; Steam link |
| 5 | Toren (alpha) | toren.html | `toren` | selected | Engineer (alpha) | Swordtales | check page; Steam link |
| 6 | SuperChem VR | superchem.html | `superchem-vr` | selected | Tech Director | Schell Games | check page |
| 7 | Domino World AR | domino.html | `domino-world-ar` | featured | Project Director | Schell Games · Google | check page |
| 8 | LEGO BrickHeadz Builder VR | lego.html | `lego-brickheadz-builder-vr` | featured | Tech Director | Schell Games · LEGO | check page |
| 9 | Ben 10: Wrath of Psychobos | ben10.html | `ben-10-wrath-of-psychobos` | selected | Programmer | Aquiris Game Studio · Cartoon Network | check page |
| 10 | Regular Show: The Great Prank War | prankwars.html | `regular-show-great-prank-war` | selected | Prototype programmer | Aquiris Game Studio · Cartoon Network | check page |
| 11 | Orion Trail VR | orionvr.html | `orion-trail-vr` | selected | Gameplay & optimization | Schell Games | check page |
| 12 | Water Bears | waterbears.html | `water-bears` | selected | Localization & porting | Schell Games | check page |
| 13 | Gendai Hero | gendai.html | `gendai-hero` | archive | Programmer (with Luiz Alvarez) | Independent | check page |
| 14 | As Aventuras do Avião Vermelho | av.html | `aventuras-do-aviao-vermelho` | archive | Programmer (course final project) | PUCRS / Ubisoft program | check page |
| 15 | Star Botanist: Garden Planet | starbotanist.html | `star-botanist` | selected | Systems & gameplay (early dev) | to confirm | check page |
| 16 | Angry Pucks | angrypucks.html | `angry-pucks` | archive | Developer (hobby) | Independent | check page |
| 17 | Sim Camisaria | simcamisaria.html | `sim-camisaria` | archive | Freelance programmer | Rockhead Games | check page |
| 18 | N.E.R.O.T. | nerot.html | `nerot` | archive | Developer (Global Game Jam 2012) | Game jam | check page |
| 19 | Search N' Find | searchfind.html | `search-n-find` | archive | Polish & mobile port | SD Technologies | check page |
| 20 | Pine Creek | pinecreek.html | `pine-creek` | archive (draft?) | Developer | Personal | check page |
| 21 | Loreisle | loreisle.html | `loreisle` | archive (draft?) | Developer (hobby) | Personal | check page |

Facts worth surfacing that the current site buries:
- The IEYTD localization module was **later used in Among Us VR and Until You Fall** — strong credibility hook for the credits strip and case study.
- HoloLAB Champions (released 2018) **won several awards** — get the award names.
- LEGO BrickHeadz Builder VR was widely noted as one of the best Google Daydream apps by outlets such as TechRadar, VRScout, and The Verge — find the articles for `links[]` (press).
- Orion Trail VR was part of the **Gear VR store launch**.
- Domino World AR supported **ARKit and ARCore**, made with Google.

### What the seeded `data/experiences.json` already contains

All 21 projects and 12 research items, with fact-only copy rewritten from the current site (typos fixed), tiers, roles, studios, platforms where the site states them, legacy redirect paths, and the two known YouTube IDs. Every entry expects its cover at `src/assets/projects/<id>/cover.png` (download from `/img/projs/<legacy>.png`). A draft `project-octavia` entry (Twin Suns) and two publications found only on LinkedIn (*Mise en Scène* and *From Their Environment to Their Behavior*) are included too. Gallery images are deliberately **not** listed yet: the agent adds them in Phase 2 after downloading and actually looking at each one, so the alt text is real. Featured case studies are short, honest drafts that Phase 6 expands with Henry.

## Research (14) — `/research.html` + LinkedIn publications

From the current site: Phlipits (SD Technologies) · CrowdVis: real-time crowd visualization framework · VRoom 360 (CMU ETC, for General Motors) · Making Them Alive (3D posture detection → animated virtual human) · Real-time ocean breaking waves · VhCVE collaborative virtual environment with facial animation and computer vision · 2D cartoon cracks from leaf-venation patterns · Large-scale terrain rendering · Real-time sky rendering · Webcam 3D scanner · VHuP virtual humans player · Solar System Simulator (2008).

Listed as publications on LinkedIn: *CrowdVis: A Framework for Real Time Crowd Visualization* · *From Their Environment to Their Behavior: A Procedural Approach to Model Groups of Virtual Agents* · *Generation of Cartoon 2D Cracks Based on Leaf Venation Patterns* · *VHuP: A Tool to Visualize Virtual Humans* · *Mise en Scène: A Framework for Virtual Humans Interactions*.

Venues, years, co-authors, and PDF/DOI links are not on either source — the agent should look them up (e.g., SBGames, SIBGRAPI, IVA proceedings, Google Scholar) and confirm with Henry. Mark the five LinkedIn-listed publications as peer-reviewed papers; the rest are research projects.

## Open questions for Henry

Answered already: **title** — Engineering Manager at Bad Robot Games since June 2026; **domain** — Option A, Henry redirects henrybraun.info himself; **career dates** — from LinkedIn.

Ask these in one batch at kickoff. Defaults in brackets are used if unanswered.

1. **Bad Robot Games** — what can be shown publicly: project names, team size you manage, systems you built as Lead Gameplay Engineer, hiring or process wins? [No project page; role and dates only.]
2. **Project Octavia (Twin Suns)** — can it be public? Any footage, and what did you own? [Keep as draft.]
3. **Target role** — engineering manager roles only, or also director / principal IC roles? This sets the headline. [Engineering Manager, Games.]
4. **Featured list** — confirm or reorder: Until You Fall, IEYTD Localization, HoloLAB Champions, LEGO BrickHeadz, Domino World AR, Arithal. [As listed.]
5. **Arithal** — current status (released? trailer? store page)? [In development.]
6. **Numbers** — for each featured project and your management role: team size, people led, your duration, platforms, and any metric (fps targets met, ms saved, languages shipped, awards). [Omit unknowns.]
7. **Media** — rights to use studio trailers/screenshots? Personal captures of your systems (GIFs, profiler shots)? A showreel? [Existing site media + public trailers.]
8. **Résumé PDF** — generate from the site (recommended) or host your own design? [Generate.]
9. **Availability line** — "Open to remote", "Open to opportunities", or nothing? [Nothing.]
10. **Pine Creek / Loreisle** — still active or keep as drafts? [Draft.]
