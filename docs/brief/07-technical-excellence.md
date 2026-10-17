# 07 — Technical excellence

"Anyone who sees this website should always see technical excellence" — so excellence is defined as measurable budgets, enforced in CI on every push, and made visible on the site itself.

## Budgets (fail the build if exceeded)

| Metric | Budget | Measured by |
|---|---|---|
| Lighthouse Performance (mobile, simulated throttling) | **≥ 95** on every route | Lighthouse CI |
| Lighthouse Accessibility / Best Practices / SEO | **100 / 100 / 100** | Lighthouse CI |
| Largest Contentful Paint | ≤ 1.8 s (mobile lab) | Lighthouse CI assertions |
| Cumulative Layout Shift | ≤ 0.02 | Lighthouse CI |
| Total Blocking Time | ≤ 100 ms | Lighthouse CI |
| JavaScript shipped on initial load | ≤ 20 KB gzip (home), ≤ 30 KB (project page) | Lighthouse `resource-summary` / size-limit |
| CSS | ≤ 30 KB gzip total | size-limit |
| Initial page weight (excl. lazy media) | ≤ 400 KB home, ≤ 600 KB project | Lighthouse `resource-summary` |
| Third-party requests before interaction | **0** | Lighthouse `third-party-summary` |
| Fonts | ≤ 3 files preloaded/used above the fold, all WOFF2 | review + Lighthouse |
| axe-core violations | **0** on every built route, light + dark | Playwright + @axe-core/playwright |
| Broken links (internal + external) | **0** (external: retries, allowlist for flaky store pages) | lychee |
| HTML validity | 0 errors | html-validate |
| TypeScript / Astro check | 0 errors | `astro check` |

Real-user field data (INP ≤ 200 ms, LCP ≤ 2.5 s at p75) is shown in the dev console; no analytics are required to hit the lab budgets.

## Accessibility (WCAG 2.2 AA, aiming higher where cheap)

- Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, ordered headings.
- Skip link, visible focus (`:focus-visible` ring 2px `--focus` + offset), logical tab order, no keyboard traps; lightbox uses `<dialog>` with focus return.
- Contrast ≥ 4.5:1 body, ≥ 3:1 large text and UI — checked for both themes by an automated contrast test over the token pairs.
- Target size ≥ 44×44 px for primary controls (≥ 24×24 minimum per WCAG 2.5.8).
- Every image has meaningful alt (build-enforced); captions are not duplicates of alt.
- Motion: reduced-motion respected; autoplay loops pausable; no flashing content.
- Videos: YouTube captions are the source; self-hosted clips are silent loops (no audio) or include captions.
- Language attributes: `lang="en"`, and `lang="pt-BR"` on Portuguese titles (e.g., *As Aventuras do Avião Vermelho*).
- Test with VoiceOver (macOS/iOS) and keyboard-only before launch (manual checklist in `08`).

## SEO & sharing

- Unique `<title>` and meta description per page (from JSON). Canonical URLs using `SITE_URL` + base.
- `@astrojs/sitemap` (public pages only), `robots.txt` pointing to it.
- Open Graph + Twitter card tags; per-project generated OG image (1200×630) with title, role, cover, and Henry's name — built with satori + resvg at build time.
- JSON-LD: `Person` (name, jobTitle, worksFor, alumniOf, sameAs [LinkedIn, GitHub]), `WebSite`, `BreadcrumbList` on project pages, `VideoGame`/`CreativeWork` with Henry as `contributor` + role, `ScholarlyArticle` for research, `VideoObject` for videos. Validate with Google's Rich Results test before launch.
- Semantic, human-readable URLs; legacy redirects preserve existing inbound links.

## Performance techniques the agent must apply

- Static HTML; islands only where needed; scripts `type="module"`, deferred, and loaded on interaction or visibility where possible.
- Critical CSS inlined automatically (`inlineStylesheets: 'auto'`); no render-blocking third-party anything.
- Self-hosted, subset WOFF2 fonts; preload only the hero display face; fallback metric overrides to avoid CLS.
- Responsive AVIF/WebP images with exact `sizes`; LCP image eager + `fetchpriority="high"`; everything else lazy.
- GIFs → video; YouTube facade; `preload="none"` on non-hero video.
- Hover-intent prefetch of project pages from cards.
- Content-hashed asset filenames → long-lived browser caching (GitHub Pages sets a short max-age on HTML; assets are immutable by name).
- No layout shift from fonts, images, video, or the sticky header.

## Security & privacy

- Strict CSP via meta tag (see `04`); no inline event handlers.
- No cookies, no trackers, no third-party requests until the user clicks a video. A one-line privacy note in the footer says so (it is a quiet flex).
- Dependabot + `npm audit` gate; Actions pinned to major versions (or SHAs).

## Code quality (the repo is part of the portfolio)

- ESLint (typescript-eslint, astro plugin) + Prettier; `astro check` in CI.
- Unit tests (Vitest) for `lib/` (URL helper, media resolution, YouTube ID parsing, sorting, schema edge cases).
- E2E (Playwright): home renders featured cards; every project page loads; YouTube facade activates and iframe gets focus; lightbox keyboard navigation; filters work with and without JS; site works under `/resume/` base path; no console errors on any page.
- Conventional commits; protected `main` requiring the CI check to pass.
- Polished public `README.md`: one-paragraph description, screenshot, live link, Lighthouse score badges (from the latest CI run), stack, "How content works" (link to this brief), local dev, license (code MIT; content © Henry Braun, all rights reserved).

## The dev console — make the excellence visible

A tasteful in-game-style debug HUD, because the audience builds games:

- Opens with <kbd>~</kbd> (backquote) or the "perf" chip in the footer; closes with <kbd>Esc</kbd>. Announced to screen readers; fully keyboard operable. Not opened automatically, never on first visit.
- Lazy-loaded module (≤ 6 KB gzip) using the `web-vitals` library to show this page view's **LCP, CLS, INP, TTFB** with green/amber/red against thresholds; transferred bytes of JS/CSS/images/fonts (Resource Timing API); number of requests; DOM node count; build info (commit SHA linked to GitHub, build time, Astro version); an FPS meter while open.
- Styled like a translucent engine overlay: mono font, tight grid, accent for headings.
- Optional fun: `help` lists commands; `theme light|dark`; `credits`. Keep it small.

## Quality gate scripts (`package.json`)

```json
{
  "scripts": {
    "check:static": "astro check && eslint . && node scripts/gen-schema.mjs --verify && node scripts/check-content.mjs",
    "build": "node scripts/media.mjs && astro build && node scripts/legacy-redirects.mjs && node scripts/resume-pdf.mjs",
    "check:dist": "lychee --config lychee.toml dist && playwright test && lhci autorun",
    "check": "npm run check:static && npm run build && npm run check:dist"
  }
}
```

`lighthouserc.json` collects every route from the built sitemap (served from `dist/` under the configured base path), 3 runs each, mobile preset, and asserts the budgets above.
