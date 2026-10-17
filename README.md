# henrybraun.info

Source for the portfolio of **Henry Braun** — Engineering Manager at Bad Robot Games, founder of Maned Wolf Games, and game engineer behind award-winning VR/AR titles at Schell Games.

**Status:** in development on the `claude/resume-site-tmyy5f` branch. The loading-screen home page, the project pages and the research pages are built. The about page, résumé, 404, indexes and redirects come next.

- [`docs/brief/README.md`](docs/brief/README.md): start here for goals, architecture, content model, quality bar and build plan.
- [`CLAUDE.md`](CLAUDE.md): working rules for anyone, human or AI agent, who builds or maintains the site, including Henry's standing requirements.
- [`docs/decisions.md`](docs/decisions.md): why things are the way they are.
- [`docs/TODO-content.md`](docs/TODO-content.md): facts and media still waiting on Henry.

It is a static [Astro](https://astro.build) site deployed to GitHub Pages, with all portfolio content in `src/content/*.json`.

## Working on it

Requires Node 22.22 or later.

```sh
npm ci
npx playwright install chromium firefox webkit   # once, for the system tests
npm run dev                                       # http://localhost:4321
npm run check                                     # light gates, as CI runs on every push
npm run check:extended                            # plus system tests on all 11 devices, 3 engines
```

Every push and deploy is gated on types, lint, formatting, content checks, unit tests at 95% or more branch coverage, and the light system tests (an Android phone and desktop Chrome, in light and dark mode). The extended system tests cover current iPhones, Android phones, an iPad and desktop Chrome, Firefox and Safari. Run them before a review with `npm run check:extended`, or on GitHub under Actions, CI, "Run workflow", with the suite set to `extended`.

---

Code © Henry Braun. Portfolio content © Henry Braun, all rights reserved.

## Single-file version

`npm run build && npm run standalone` writes `standalone/index.html`: the home page with its fonts, images, styles and scripts inlined into one file. It opens straight from disk and works as a static page anywhere, GitHub Pages included. Project and research links point at the matching pages on henrybraun.info, since the project pages are not part of the single file.
