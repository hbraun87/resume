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
