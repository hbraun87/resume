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

## 2026-10-17 · A single-file copy of the home page

- **Decision:** `scripts/standalone.mjs` packs the built home page into `standalone/index.html`, with fonts and one WebP per card inlined as data URIs and the scripts inlined as modules. It drops the CSP meta (its hashes cover the separate files, and a file opened from disk has no origin for `'self'`) and the prefetch script. Project and research links go to the same projects on henrybraun.info through each entry's `legacyPaths`; entries without one show their title without a link. The file is committed so it can be opened or hosted as is.
- **Why:** Henry asked (Oct 17, 2026) for one self-sufficient HTML file he can open locally and host as a static page on GitHub Pages, while the full site is still going through its gates.
- **Alternatives:** zipping `dist/` (several files, and module scripts are blocked from `file://`).

## 2026-10-17 · No asset log, no birthplace

- **Decision:** Henry asked to remove the floating asset-stream log (the `levels/….lvl` and `shaders/….glsl` lines at the bottom right) and every mention of where he was born. The log is gone; game cards still count toward "Streaming levels (N/21)" in the HUD. The boot console's origin line now reads `base Pittsburgh, PA`, the character sheet has no Origin row, the bio starts with his degree, `home.origin` is out of the schema, and the chimarrão tip is gone. Work locations in `roles` stay in the data but are not shown.
- **Why:** Henry's call (Oct 17, 2026); his word wins over spec `10`.

## 2026-10-17 · A PlayStation platform group, and a mixed top row

- **Decision:** `platformGroup` gains `playstation`. Until You Fall and I Expect You To Die show PlayStation instead of VR, the filters read All · PC · Mobile · PlayStation · VR · AR, and the first cards alternate platforms (Until You Fall, 4:LOOP, I Expect You To Die, Project Octavia, Ben 10, then the VR titles). 4:LOOP and Project Octavia are new public entries, grouped as PC (Steam is their link), with no cover art until Henry confirms rights. Cards without a henrybraun.info page link to Steam in the single-file copy.
- **Why:** Henry (Oct 17, 2026): VR repeated too often, and PC and Mobile should show near the top.
- **Alternatives:** several platform chips per card (busier cards, and the filters would need multi-group logic).

## 2026-10-17 · Light and extended test suites

- **Decision:** `npm run check` (every push and every deploy) runs the static gates, unit tests with the 95% branch coverage gate, the build, and the light system tests: Pixel 9 Pro XL and desktop Chrome. The extended suite runs all eleven profiles in Chromium, Firefox and WebKit, via `npm run check:extended` or the CI workflow run by hand with `extended`.
- **Why:** Henry (Oct 17, 2026): "split test in light and extended so we run light by default but can run extended when needed." The full run took about 19 minutes per push.
- **Alternatives:** extended on pull requests to `main` only (Henry asked for on demand).

## 2026-10-18 · Steam media for 4:LOOP and Project Octavia

- **Decision:** the 4:LOOP and Project Octavia cards and pages use the screenshots from their Steam store pages, and 4:LOOP's page plays its gameplay reveal trailer through the YouTube facade (ID from the PlayStation Blog announcement). Octavia's only trailer is a Steam stream with no YouTube upload, so it is left out; its page links to Steam. The cloud sessions cannot reach Steam, so `steam-media.yml` (run by hand) downloads the files on a GitHub runner.
- **Why:** Henry (Oct 18, 2026) asked for the images and video from the Steam pages, which is his OK on using that art.
- **Alternatives:** self-hosting the Octavia trailer as an MP4 (the site has no self-hosted video player yet, and it would be the heaviest file on the site).

## 2026-10-18 · The load completes when the finale is on screen

- **Decision:** the load completes, and the finale bursts, as soon as three quarters of the finale frame are on screen, or at the bottom of the page, whichever comes first. If the visitor presses PRESS START before the burst, the Completionist toast is skipped so it does not cover the email message.
- **Why:** Henry (Oct 18, 2026): the finale waited for the very bottom of the page, so by the time it fired the frame had scrolled out of view.
- **Alternatives:** a lower completion threshold on scroll progress (the right value depends on page and screen height, so the finale could still fire off screen).

## 2026-10-18 · Two platform chips, joining dates, no build-stage labels

- **Decision:** games can list more platforms in `alsoOn`, each shown as its own chip and counted under each filter; Until You Fall, I Expect You To Die and 4:LOOP show PlayStation and PC. Current roles in the quest log are dated from when Henry joined the company, so Bad Robot Games reads 2024–present. Role labels no longer carry "(alpha)", "(prototype)" or "(freelance)", and Toren lost its "Alpha version" subtitle.
- **Why:** Henry (Oct 18, 2026): use his 2024 Bad Robot start, tag games on both PlayStation and PC, and drop the qualifiers as not relevant.
- **Alternatives:** making `platformGroup` an array (every entry and test would change for three games).

## 2026-10-18 · Engineer titles

- **Decision:** Henry's Programmer titles read Gameplay Engineer, on roles and project cards. His two Twin Suns roles are one: Senior Engineer, Oct 2021 to Jan 2024, also on Project Octavia. Toren shows PlayStation and PC.
- **Why:** Henry (Oct 18, 2026): "on the twin suns project keep just senior engineer", "replace programmer for gameplay engineer", and Toren was a PlayStation and PC title. His word overrides the LinkedIn titles in `09-migration-inventory.md`.

## 2026-10-18 · Hidden projects

- **Decision:** `visibility` gains a third value, `hidden`: the entry stays in `experiences.json` with its media and is held to the same checks as a public one, but no page, card, count or filter includes it. Loreisle and Angry Pucks are hidden, so the game count reads 21. Showing one again is a one-word change to `public` (see README).
- **Why:** Henry (Oct 18, 2026) wanted to see the site without Loreisle and Angry Pucks, to put the weight on the important titles, without deleting them, and to toggle visibility easily.
- **Alternatives:** reusing `draft` (it means unreleased or confidential work and is checked loosely, so a project could quietly break while switched off); a separate `hidden: true` flag (two fields that could disagree).

## 2026-10-18 · GitHub link and build line hidden

- **Decision:** profile links take an optional `visibility` (`public` or `hidden`), and `profile.json` gains `footer.buildLine`. The GitHub link and the "Built with Astro · Source on GitHub · Build" footer line are hidden; email, LinkedIn and the "No cookies, no trackers" line stay.
- **Why:** Henry (Oct 18, 2026): hide the GitHub link and the build line for now, since pointing visitors at the source is not relevant. He asked to hide rather than delete, so both are a one-word switch back.
- **Alternatives:** deleting the link and the line (Henry wants to toggle them).

## 2026-10-18 · A shorter game list led by 4:LOOP

- **Decision:** Sim Camisaria, N.E.R.O.T., Search N' Find, Pine Creek and Gendai Hero are hidden too, and 4:LOOP moves to first, ahead of Until You Fall. The N.E.R.O.T. loading tip is removed and the games intro no longer mentions the game jam runner, so no visible text points at a hidden project. 4:LOOP stays a regular-size card: a large featured card needs a case study of what Henry did on it, which only he can supply.
- **Why:** Henry (Oct 18, 2026): less is more, so the smaller credits stop diluting the main titles, and 4:LOOP is his current and biggest project.
- **Alternatives:** keeping the small titles in a collapsed archive list (still dilutes the page Henry wants to see).

## 2026-10-18 · henrybraun.dev

- **Decision:** the site moves to Henry's domain, https://henrybraun.dev/, served by GitHub Pages at the domain root. The deploy builds for that address unless the `SITE_URL` and `BASE_PATH` repository variables say otherwise; CI keeps testing the `/resume` subpath so both setups stay working. The single-file copy links every card to its page on henrybraun.dev instead of the old henrybraun.info pages and Steam. DNS lives at Squarespace, where Henry bought the domain: four A and four AAAA records for the root, and a `www` CNAME to `hbraun87.github.io`.
- **Why:** Henry (Oct 18, 2026) bought henrybraun.dev and asked for it to point to the new site.
- **Alternatives:** keeping the build at `/resume` and redirecting (GitHub Pages serves a custom domain at its root, so the paths would break); moving DNS to another provider (no benefit for a static site).

## 2026-10-18 · A softer contact section

- **Decision:** the contact section's headline reads "Say hello." and the line under it is gone; `home.contactLede` is now optional, so a line can come back by adding it to `profile.json`.
- **Why:** Henry (Oct 18, 2026) is still employed, and "Your project is next in the queue." read like an active job search. He picked "Say hello." from three softer options.
- **Alternatives:** "Always up for talking games. Let's connect." and "Open to conversations about what's next."

## 2026-10-19 · Portrait in the character sheet

- **Decision:** the photo of Henry with his Samoyed (from henrybraun.info, already in `src/assets/profile/`) shows at the top of the character sheet as AVIF/WebP at 360–800px, lazy-loaded, in a 4:3 frame (2:1 on tablets, where the sheet is full width). `portrait.visibility` in `profile.json` switches it off.
- **Why:** Henry (Oct 19, 2026) wanted to try his photo on the site, with an easy rollback.
- **Alternatives:** a round avatar beside the bio (crops the dog out); the hero (competes with the boot sequence).

## 2026-10-19 · A shorter research list

- **Decision:** Mise en Scène, Webcam 3D Scanner, VHuP, VhCVE and A Simple Model for Real-Time Sky Rendering are hidden, and VRoom 360 moves up to second, after the ocean breaking waves paper. The R&D count reads 9.
- **Why:** Henry (Oct 19, 2026): those projects are no longer relevant, and "making waves" and VRoom 360 should lead. "Making waves" is read as the ocean waves paper; if he meant Making Them Alive, it is a one-number change to `order`.
- **Alternatives:** none worth keeping.

## 2026-10-19 · Centered portrait, VRoom 360 as AR

- **Decision:** the portrait uses `henry-centered.jpg`, the original with the empty right edge trimmed (1024 to 900px wide) so Henry and his dog sit centered; `henry.jpg` stays in place, so pointing `portrait.src` back at it undoes the crop. VRoom 360 is tagged AR, and its text spells out Carnegie Mellon University instead of CMU ETC.
- **Why:** Henry (Oct 19, 2026): VRoom 360 was an AR project, the school's full name matters, and the photo had too much space on the right.
- **Alternatives:** shifting `object-position` only (cannot recenter on phones and desktop, where the whole width shows).

## 2026-10-19 · Privacy line hidden

- **Decision:** `footer.privacyLine` in `profile.json` hides "No cookies, no trackers, no third-party requests." The site still makes no such requests; only the line is gone. The HUD test now measures the footer's last element instead of its last paragraph, since the footer can end with the link row.
- **Why:** Henry (Oct 19, 2026): the line is out of context and takes attention from his work.
- **Alternatives:** deleting the line (Henry prefers switches he can flip back).

## 2026-10-19 · 4:LOOP in the spotlight

- **Decision:** entries gain an optional `spotlight` flag. The spotlight card spans the whole first row of the games grid, with the art and text side by side on wide screens and a larger title; on phones it stacks like the other cards. 4:LOOP is the spotlight. A system test checks the spotlight card leads the grid at full width.
- **Why:** Henry (Oct 19, 2026) wants 4:LOOP, his current and biggest project, to be the center of attention. Making it a `featured` card would need a case study only he can write, and featured cards only span two columns.
- **Alternatives:** `tier: "featured"` with a case study (blocked on Henry's words, and still smaller than the full row).

## 2026-10-19 · Domino World AR as a regular card; the games grid never has three columns

- **Decision:** entries gain an optional `card` field (`wide` or `regular`). A featured entry is a wide card unless `card` is `regular`, which keeps its case-study project page but shows a regular card on the home grid. Domino World AR is set to `regular`, so the grid holds five wide cards and ten regular ones (20 cells). The games grid now uses one, two or four columns, chosen by a container query on the games section, instead of `auto-fill`, which produced three columns between about 940 and 1310px and left a gap on the last row. Four columns start at a 60rem grid (about 1110px windows), so 1180 and 1280px screens get four.
- **Why:** Henry wanted As Aventuras do Avião Vermelho off its own last row. With wide cards spanning two columns, 20 cells fill four and two columns exactly; three columns can't.
- **Alternatives:** changing Domino World's tier to `selected` (drops its case-study page layout); keeping `auto-fill` (gaps at laptop and iPad-landscape widths).

## 2026-10-19 · Character sheet level with the bio; fewer skills; Solar System Simulator hidden

- **Decision:** on desktop the profile headline moves into the bio column and the character sheet starts level with it, so both columns end close together (within about 100px from 900 to 1920px, down from 250 to 500px). The photo spans the sheet: 4:3 on phones, 16:10 from 560px up, anchored near the top so only the bottom is trimmed (a 16:9 crop centered lower cut off Henry's head and the dog's ears; a scaled-down 4:3 photo left empty margins Henry didn't like). The four stats sit on one row when the sheet is wide enough; the lines between them are borders, because a 1px grid gap vanished on screens scaled to 125% or 150%. Phones and tablets keep the stacked order. Localization & porting, Procedural generation, Real-time rendering and Computer vision leave the skill tree (they live only in `profile.json`, so adding one back is one line). Solar System Simulator is hidden, leaving eight research entries.
- **Why:** Henry saw a large empty gap under the bio beside the taller character sheet and asked for the photo to shrink a bit and four skills to go.
- **Alternatives:** shrinking only the photo (the sheet was still about 450px taller than the bio at 1440px).

## 2026-10-19 · Sharper portrait

- **Decision:** the portrait source is now `henry-centered.png`, cut losslessly from the 1024×768 PNG Henry supplied (same 900px-wide centered framing), replacing a JPEG re-encode of a JPEG. The `<Picture>` serves 400, 640 and 900px widths at quality 80 with a JPEG fallback; before it served up to 800px with sharp's default AVIF quality of 50, which smeared hair and beard detail.
- **Why:** Henry saw the photo as low resolution. The original is only 1024px wide, so on a 2x screen at desktop width the 900px image is still slightly upscaled; a larger original would be the next step.
- **Alternatives:** keeping the JPEG source with higher quality (still two generations of JPEG loss).

## 2026-10-19 · Contained covers for text banners

- **Decision:** a cover can set `"fit": "contain"`. The card then shows the whole image, centered over a blurred, dimmed copy of itself that fills the rest of the art band, instead of cropping it. The I Expect You To Die localization banner uses it.
- **Why:** wide cards on desktop use a 21:9 art band and phones a 16:9 one, so the banner (about 1.9:1) lost its headline and footer text on desktop. Photos and screenshots crop well, so `cover` stays the default.
- **Alternatives:** a 16:9 band for all wide cards (taller cards, uneven rows); a different cover image (Henry chose this one).

## 2026-10-22 · PRESS START opens the visitor's mail app

- **Decision:** PRESS START stays a `mailto:` link with JavaScript on, so it opens the visitor's mail app with Henry's address filled in. It still completes the load, bursts the finale and copies the address, and the toast says the mail app is opening and the address is copied in case nothing opens. `linkToButton` is removed, since nothing uses it now.
- **Why:** Henry asked for the button to open an email. Before, it only copied the address.
- **Alternatives:** opening the mail app only (visitors with webmail and no mail app would get nothing); a prefilled subject (Henry didn't ask for one).
