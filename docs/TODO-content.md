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
| 10  | Pine Creek and Loreisle                                                           | Public as in development: Henry's Build Spec lists both among his 21 titles                      |

## Media migration (Phase 2), done

Migrated from Henry's local copy of henrybraun.info (`D:\Projects\Web\henrybraun.info`), because the build environment cannot reach the live site.

- 171 gallery images across 33 entries, recompressed to JPEG under `src/assets/projects/<id>/`, each with alt text written from the image itself. Thumbnails, duplicate frames and logo-only images were left out.
- A cover for every entry with images, and 28 YouTube videos from the old pages added to the two already in the JSON.
- Research entries carry their old `/research/<page>.html` path in `legacyPaths` for redirects.
- Portrait: `src/assets/profile/henry.jpg`.

Not migrated, for Henry to decide:

- Research PDFs in the old `files/` folder (papers and theses). They need a decision on whether the PDFs can be republished.
- Orphan pages `dp.html` and `star.html`, which nothing on the old site links to.
- I Expect You To Die localization has only one image (the announcement). Personal captures would help.
- Environment to Behavior, Mise en Scène and Project Octavia have no media on the old site.
- The old CV PDF; the plan is to generate the résumé from the site instead (kickoff default 8).
- Media rights: the galleries are the screenshots already public on henrybraun.info. Key art for client titles (Ben 10, Regular Show, Toren, Until You Fall) needs Henry's confirmation before launch, per CLAUDE.md.

## Facts to confirm

- Roles where the Build Spec and LinkedIn differ; the site uses LinkedIn's (rule in `CLAUDE.md`): Until You Fall is "Gameplay Engineer" (spec: tech lead), Arithal is "Founder" (spec: co-founder). The spec's "joined Schell Games in 2013" is shown as 2015, after Vissman Management (2013), per LinkedIn.

- HoloLAB Champions: names of the awards.
- LEGO BrickHeadz Builder VR: links to the TechRadar, VRScout and The Verge articles.
- Publications: venues, years, co-authors, PDF or DOI links for CrowdVis, VHuP, Mise en Scène, cartoon cracks, and the virtual-agent groups paper.
- Recent roles (Bad Robot Games, Twin Suns, Maned Wolf Games): highlights are empty until Henry says what can be public.
- Featured case studies: personal contributions, hardest problem, numbers (Phase 6 interviews).
