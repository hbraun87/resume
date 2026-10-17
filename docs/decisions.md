# Decisions

Short log of non-obvious choices. Newest last.

## 2026-10-17 · Astro 7.3.8, not 7.4.0

- **Decision:** pin Astro 7.3.8, the latest 7.x patch with more than a week in the wild.
- **Why:** 7.4.0 was published two days before the build started. Dependabot will propose it.
- **Alternatives:** 7.4.0 (newest, untested by others yet).

## 2026-10-17 · Fonts: Unbounded, Instrument Sans, JetBrains Mono, self-hosted

- **Decision:** use the type from the Build Spec in the project folder, served from Fontsource packages through Astro's font API with the local provider (Latin subset only, which covers Portuguese diacritics).
- **Why:** the Build Spec's look is the more distinctive one; self-hosting keeps the "no third-party requests" rule from `CLAUDE.md`. The `npm` font provider was rejected because it downloads from jsDelivr at build time.
- **Display face:** the static 900 cut. Both the static and variable files have overlapping inner contours, so outlined lettering paints the stroke under an ink-colored fill (`paint-order: stroke fill`) to hide them.
- **Alternatives:** Bricolage Grotesque + Inter from `03-design-system.md`. Pending Henry's choice of site concept.

## 2026-10-17 · Stylesheets always inlined

- **Decision:** `build.inlineStylesheets: 'always'`.
- **Why:** removes the only render-blocking request; the whole stylesheet is a few KB. Revisit if CSS per page grows past ~20 KB.

## 2026-10-17 · CSP through Astro's `security.csp`

- **Decision:** let Astro generate the CSP meta tag with hashes for every inline script and style, plus the directives from `04-architecture.md`.
- **Why:** GitHub Pages cannot send headers, and generated hashes stay correct as the pages change.

## 2026-10-17 · GitHub Actions versions

- **Decision:** `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`, Node `lts/*`; the latest major tags on the build date.

## 2026-10-17 · Combine the repo brief and the loading-screen Build Spec

- **Decision:** Henry chose to combine both briefs. The loading-screen spec (`docs/brief/10-loading-screen-spec.md`) drives the home page and the look; `01`–`09` drive architecture, content model, project pages, résumé, and quality gates. Conflict rules live in `CLAUDE.md`.
- **Why:** the loading sequence is the memorable hook for game studios; the repo brief adds the depth hiring managers check.
- **Alternatives:** loading screen only (single page); repo brief only (calm multi-page).

## 2026-10-17 · Cover images are optional

- **Decision:** `cover` is optional for every entry. Cards without a cover render the loading-screen spec's art band: platform tint plus the title's outlined initials glyph. `check-content` warns when a public featured entry has no cover, and fails when a referenced file is missing.
- **Why:** the loading-screen spec designs cards to work without images, and the migrated media is not downloaded yet; a cover reference to a missing file would be a false claim in the data.
- **Alternatives:** require covers (blocks the build until media migration).

## 2026-10-17 · Working notes leave the content files

- **Decision:** removed the `_notes` key from `profile.json`; its content lives in `docs/TODO-content.md`. `check-content` rejects any `_`-prefixed key in content.

## 2026-10-17 · Media migrated from Henry's local copy of the old site

- **Decision:** galleries, covers, YouTube ids and the portrait come from `D:\Projects\Web\henrybraun.info`, recompressed to JPEG, with alt text written from each image. Research pages keep their old URL in `legacyPaths`.
- **Why:** the build environment's network policy blocks henrybraun.info; Henry pointed to his local copy.
- **Alternatives:** wait for network access; scrape the Wayback Machine (lower quality, same blocker).

## 2026-10-17 · 95% branch coverage gate on `src/lib`

- **Decision:** `npm run check` runs `vitest run --coverage` with `@vitest/coverage-v8` and fails below 95% branches (and 95% functions, lines, statements). Coverage is measured on `src/lib/**`. Logic that used to live in `scripts/*.mjs` moved into `src/lib` (`content-check.ts`, `scaffold.ts`, `json-schema.ts`) so it is measured; the scripts are now thin file I/O. Client-side logic added in later phases goes in `src/lib` too.
- **Why:** Henry's standing requirement: nothing goes to him for review unless it is gated by 95% branch coverage and the system tests it needs. Measuring Astro markup with line coverage says little; behavior in the browser is covered by the Playwright system tests instead.
- **Dependency:** `@vitest/coverage-v8` (dev only), the coverage provider maintained with Vitest; no runtime cost. `zod` is now a direct dependency (pinned to the version Astro ships) because `src/lib` imports it.
- **Alternatives:** istanbul provider (slower, same result); covering `scripts/` by spawning them (slow, brittle).

## 2026-10-17 · System tests on real engines and current devices

- **Decision:** Playwright tests in `tests/e2e/` run against the production build on 11 profiles: iPhone 17 Pro Max, iPhone 17 and iPhone 17 Pro landscape, and iPad Pro 11 in WebKit; Galaxy S24 (360px) and Pixel 9 Pro XL in Chromium; desktop Chrome, Firefox and Safari; a 1920px screen and a 320px window. Each built page is tested in light and dark mode for console errors, third-party requests, horizontal overflow, axe (WCAG 2.2 AA), dead in-page links, image alt and size, and touch target size; the theme, keyboard, no-JS, reduced-motion and mobile-setup behaviors have their own tests. `npm run check` runs them after the build; CI installs all three engines.
- **Why:** Henry's standing requirement that phones, especially the latest iPhones and Android phones, work as well as desktop, and that nothing reaches him for review without system tests. Real WebKit is the closest thing to iOS Safari that runs in CI.
- **Dependency:** `@axe-core/playwright` (dev only), Deque's official axe integration, pinned to 4.13.0 rather than the 4.14.0 published two days earlier.
- **Fixes found while writing them:** `text-size-adjust: none` blocked text enlargement on iOS (now `100%`); `theme-color` was always dark (now one per scheme, updated by the toggle); header links pointed at home page sections that do not exist yet (removed until those sections ship).
- **Alternatives:** Chromium-only device emulation (misses Safari bugs, which is the main iPhone risk); a cloud device farm (cost, credentials, third-party access to previews).

## 2026-10-17 · Video posters come from Henry's own images

- **Decision:** a YouTube facade's poster is its `poster` field, else the entry's cover, else its first image (`posterFile()` in `src/lib/media.ts`). Nothing is downloaded from `i.ytimg.com`; brief `06` suggested build-time thumbnail downloads.
- **Why:** the project's captures look better than YouTube's auto thumbnails, need no network at build (the build environment cannot reach YouTube), and keep the page free of YouTube requests until the visitor clicks. Every entry with a video already has images.
- **Alternatives:** download thumbnails in CI with a cache (adds network to the build and still needs an offline fallback).

## 2026-10-17 · DOM logic is unit tested in happy-dom

- **Decision:** browser behavior (YouTube facade, lightbox) lives in `src/lib/*.ts` as plain functions over the DOM, unit tested in `happy-dom` (dev only, 20.14.6 rather than the 21.x major published days earlier) with network loading switched off, and system tested in real browsers by Playwright. Components only render markup and call the enhancer.
- **Why:** keeps all logic under the 95% branch coverage gate instead of hiding it in component scripts the gate cannot see.
- **Alternatives:** jsdom (heavier, slower, same coverage); Vitest browser mode (a second browser runner next to Playwright).

## 2026-10-17 · Lightbox on a native `<dialog>`

- **Decision:** thumbnails are links to a 2400px WebP; with JavaScript they open one shared `<dialog>` with previous, next and close buttons, arrow keys, swipe, backdrop click and Escape, and focus returns to the thumbnail. On phones the arrows sit under the image.
- **Why:** `showModal()` gives focus trapping, inert background and Escape for free in every current browser; the link keeps it working without JavaScript and lets modified clicks open a new tab.
- **Alternatives:** a lightbox library (a runtime dependency for what the platform now does).

## 2026-10-17 · GIF and clip pipeline deferred until there is a GIF or clip

- **Decision:** `scripts/media.mjs` (ffmpeg conversion of GIFs and cover loops, brief `06`) is not built yet. No content uses `gif`, `video` or `coverLoop`; `check-content` fails the build if a public entry does, so nothing ships unrendered.
- **Why:** it would add `ffmpeg-static` (a large binary) and a cache step for zero current media. It lands with the first GIF or clip Henry provides.
- **Alternatives:** build it now as the plan lists (unused code and dependency weight).

## 2026-10-17 · The loading-screen home page, built from the data

- **Decision:** the home page follows spec `10` section by section (boot console, player profile, level select, R&D lab, finale, loading HUD), with every word coming from `profile.json` and `experiences.json`. Where the spec hard-codes numbers or facts, the page computes them: the character sheet shows "Titles in the log" (all public games, including the two in development) and "R&D projects" (all public research) instead of the spec's "20+ shipped" and "12"; the quest log lists current roles, then one line per earlier employer from `roles`, then `education`. Research rows link to the site's own research pages, not the old `.html` files. The brief `02` credits strip sits under the hero as text. Game cards show each entry's cover under a 30% platform tint (the spec's first listed upgrade), falling back to the outlined-initials glyph.
- **Why:** CLAUDE.md rule 2 (content is data) and rule 5 (no invented facts). The spec's bio and quest log say Henry joined Schell Games in 2013 and shipped Arithal; the data says 2015 and in development.
- **Alternatives:** copy the spec's text into components (would drift from the JSON and repeat its factual slips).

## 2026-10-17 · The loading layer is progressive enhancement

- **Decision:** without JavaScript the HUD, asset log, filters and Copy button stay hidden, every card shows, the finale headline is plain text and PRESS START is a `mailto:` link. `src/lib/home.ts` reveals the HUD, swaps the link for a button, types the console (already in the HTML, so nothing shifts) and starts the canvas. All of it is unit tested in happy-dom with injected observers, frames, timers and a fake 2D context, and system tested on every phone and desktop profile.
- **Why:** CLAUDE.md: the loading metaphor must never block reading.

## 2026-10-17 · Denser finale particles than the spec

- **Decision:** the particle grid step is `sqrt(width × height / 12000)` (at least 3px), about 2,500–3,500 particles, instead of the spec's `/ 5200` (~1,500).
- **Why:** at ~1,500 particles the four-line headline on a 375px phone came out about two particles per letter stroke and was hard to read. Drawing is one `fillRect` per particle and only runs while the stage is on screen.
- **Alternatives:** keep 1,500 and make the stage taller on phones (pushes the contact row further down).

## 2026-10-17 · Clipped buttons paint their shape on `::before`

- **Decision:** the header Email button, PRESS START and the "Next project" link draw their clipped-corner background on a `::before` layer instead of clipping the element itself.
- **Why:** `clip-path` on the element also clipped its focus outline, so keyboard users could not see focus on those controls.
