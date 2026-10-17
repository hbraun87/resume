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
