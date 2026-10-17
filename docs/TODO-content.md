# Content still needed

Facts and media the site is waiting on. Nothing here is invented: unknown values stay out of the JSON until Henry confirms them.

## Kickoff questions (asked Oct 17, 2026) and the defaults in use

| #   | Question                                                                          | Default in use until Henry answers                                                               |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | What Bad Robot Games work can be public?                                          | Role and dates only, no project page                                                             |
| 2   | Can Project Octavia (Twin Suns) be public, and what did Henry own?                | Draft (hidden)                                                                                   |
| 3   | Target roles for the headline                                                     | "Engineering Manager, Games"                                                                     |
| 4   | Featured list                                                                     | Until You Fall, IEYTD Localization, HoloLAB Champions, LEGO BrickHeadz, Domino World AR, Arithal |
| 5   | Arithal status                                                                    | In development                                                                                   |
| 6   | Numbers for featured projects (team size, people led, platforms, awards, metrics) | Left out                                                                                         |
| 7   | Media rights; personal captures; showreel                                         | Current site media and public trailers                                                           |
| 8   | Résumé PDF                                                                        | Generated from the site                                                                          |
| 9   | Availability line                                                                 | None                                                                                             |
| 10  | Pine Creek and Loreisle                                                           | Draft (hidden)                                                                                   |

## Media migration (Phase 2), blocked

The cloud build environment cannot reach `henrybraun.info` yet (network policy). Once it can, download for every project page `https://henrybraun.info/projects/<legacy>.html`:

- cover `/img/projs/<legacy>.png` → `src/assets/projects/<id>/cover.png`, then add `cover` with real alt text;
- full-size gallery images `/img/<legacy>/<n>.png` (not `_thumb`) → `media[]`;
- any YouTube embed ids not already in the JSON;
- research figures from `/research.html`, and the portrait `/img/henry.png` → `src/assets/profile/`.

Cover references were removed from `experiences.json` until the files exist, so the content check stays honest.

## Facts to confirm

- HoloLAB Champions: names of the awards.
- LEGO BrickHeadz Builder VR: links to the TechRadar, VRScout and The Verge articles.
- Publications: venues, years, co-authors, PDF or DOI links for CrowdVis, VHuP, Mise en Scène, cartoon cracks, and the virtual-agent groups paper.
- Recent roles (Bad Robot Games, Twin Suns, Maned Wolf Games): highlights are empty until Henry says what can be public.
- Featured case studies: personal contributions, hardest problem, numbers (Phase 6 interviews).
