# 04 — Architecture

## Stack decision

| Choice | Why |
|---|---|
| **Astro** (current stable; static output) | Ships zero JS by default, first-class content collections with schema validation, built-in responsive image pipeline (AVIF/WebP), official GitHub Pages deployment path. Ideal for a content-driven, performance-obsessed site. |
| **TypeScript (strict)** | Typed content from the schema straight into components. |
| **Hand-written CSS with design tokens** (no CSS framework) | Smallest CSS, full control over the elegant details. Scoped styles in `.astro` components + one global tokens/reset file. |
| **Zod schema** (via `astro/zod`) as the single source of truth for content | Build fails on invalid JSON with a precise error; a JSON Schema is generated from it for editor autocomplete. |
| **Minimal islands** — plain TypeScript web components, no UI framework | YouTube facade, loop video controller, lightbox, filter, dev console. Each < 5 KB gzipped. |
| **GitHub Actions → GitHub Pages** | Required by Henry. Free, HTTPS, custom domain support. |

Alternatives considered and rejected (record in `docs/decisions.md`): Next.js static export (heavier runtime), Jekyll (weaker image/data tooling), Eleventy (viable, but Astro's typed collections and image pipeline fit the "edit JSON" requirement better), Tailwind (fine, but hand-tuned tokens serve the elegance goal and produce less CSS).

## Repository layout

```
resume/
├── .github/
│   └── workflows/
│       ├── deploy.yml            # build + quality gates + deploy on push to main
│       └── ci.yml                # same gates on pull requests (no deploy)
├── .claude/commands/             # /add-experience, /audit
├── .vscode/settings.json         # maps experience.schema.json → experiences.json
├── CLAUDE.md
├── README.md                     # public, polished: what this is, stack, how to add content, scores badge
├── docs/
│   ├── brief/                    # this folder
│   ├── decisions.md              # ADR-lite log
│   └── TODO-content.md           # facts/media still needed from Henry
├── public/
│   ├── favicon.svg, apple-touch-icon.png, site.webmanifest
│   └── media/                    # GENERATED video files (gitignored) — see 06
├── scripts/
│   ├── media.mjs                 # GIF → MP4/WebM + posters, hover loops; hash-cached
│   ├── new-experience.mjs        # scaffold an entry
│   ├── gen-schema.mjs            # Zod → experience.schema.json
│   ├── check-content.mjs         # TODO markers, missing alt, orphan/missing assets
│   ├── legacy-redirects.mjs      # postbuild: old /projects/*.html → new URLs
│   └── resume-pdf.mjs            # postbuild: print /resume/ → PDF with Playwright
├── src/
│   ├── content.config.ts         # collections + Zod schemas
│   ├── content/
│   │   ├── experiences.json      # ← Henry edits this
│   │   ├── profile.json          # ← and this (bio, roles, skills, contact)
│   │   └── experience.schema.json  # generated, committed (for editor + CI diff)
│   ├── assets/
│   │   ├── profile/              # portrait
│   │   └── projects/<slug>/      # cover.jpg, 01.png, combo.gif, loop.mp4 …
│   ├── components/               # see 03 component list
│   ├── layouts/Base.astro, Project.astro
│   ├── lib/
│   │   ├── url.ts                # base-aware URL helper
│   │   ├── content.ts            # queries: featured(), byTier(), related(), sort rules
│   │   ├── media.ts              # resolves JSON media paths → imported assets; fails loudly
│   │   └── seo.ts                # titles, OG, JSON-LD builders
│   ├── pages/
│   │   ├── index.astro
│   │   ├── work/index.astro
│   │   ├── work/[slug].astro     # getStaticPaths from experiences (visibility = public)
│   │   ├── research.astro
│   │   ├── about.astro
│   │   ├── resume.astro
│   │   ├── styleguide.astro      # noindex
│   │   ├── og/[slug].png.ts      # build-time OG images (satori + resvg)
│   │   ├── 404.astro
│   │   ├── sitemap/robots via @astrojs/sitemap + robots.txt.ts
│   └── styles/tokens.css, reset.css, global.css
├── tests/
│   ├── e2e/*.spec.ts             # Playwright: navigation, media, lightbox, keyboard
│   └── a11y.spec.ts              # axe on every built route
├── astro.config.mjs
├── lighthouserc.json
├── lychee.toml                   # link checker config
├── package.json
└── tsconfig.json
```

## Content loading

Both JSON files are content collections loaded with Astro's `file()` loader. `experiences.json` keeps a top-level `$schema` key for editor support, so a custom parser selects the array:

```ts
// src/content.config.ts (illustrative — check current Astro docs for exact API)
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { experienceSchema, profileSchema } from './lib/schema';

const experiences = defineCollection({
  loader: file('src/content/experiences.json', {
    parser: (text) => JSON.parse(text).experiences,   // array of entries, each with "id"
  }),
  schema: experienceSchema,
});

const profile = defineCollection({
  loader: file('src/content/profile.json', {
    parser: (text) => [{ id: 'henry', ...JSON.parse(text) }],
  }),
  schema: profileSchema,
});

export const collections = { experiences, profile };
```

- `src/lib/schema.ts` holds the Zod schemas (spec in `05`). `scripts/gen-schema.mjs` converts them to `experience.schema.json` (Zod 4: `z.toJSONSchema()`; Zod 3: `zod-to-json-schema`). CI fails if the committed schema differs from the generated one.
- **Media paths in JSON are strings** relative to `src/assets/projects/<id>/`. `src/lib/media.ts` resolves them with `import.meta.glob('/src/assets/projects/**/*.{jpg,jpeg,png,webp,avif,gif}', { eager: true })` so Astro's `<Picture>` can optimize them. A path that does not resolve throws at build: `experiences.json → until-you-fall → media[2].src "combat.gif" not found in src/assets/projects/until-you-fall/`.
- Entries with `"visibility": "draft"` are excluded from pages, sitemap, résumé, and OG generation, but still validated.

## Routing and URLs

- Projects: `/work/<id>/`, where `id` is the kebab-case slug in JSON. Trailing slashes everywhere (`trailingSlash: 'always'`, `build.format: 'directory'`).
- **Base path.** The repo is `hbraun87/resume`, so without a custom domain the site lives at `https://hbraun87.github.io/resume/`. Configure via env so both work:

```js
// astro.config.mjs (illustrative)
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = process.env.SITE_URL ?? 'https://henrybraun.info';
const BASE = process.env.BASE_PATH ?? '/';            // '/resume' if no custom domain

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [sitemap({ filter: (p) => !p.includes('/styleguide/') })],
  image: { layout: 'constrained' },                  // responsive images by default (if supported)
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
```

  Every internal link uses `url('/work/until-you-fall/')` from `src/lib/url.ts`, which prefixes `import.meta.env.BASE_URL`. A Playwright test crawls the built site served under `/resume/` to catch any hard-coded root link.

- **Legacy URLs.** The current site's pages (`/index.html`, `/projects.html`, `/research.html`, `/projects/<old>.html`) must keep working if `henrybraun.info` moves to this repo. Each experience has `legacyPaths` in JSON; `scripts/legacy-redirects.mjs` writes a tiny HTML file at each old path with `<link rel="canonical">`, `<meta http-equiv="refresh" content="0; url=…">`, and a `location.replace()` fallback. (GitHub Pages cannot send server-side 301s; this is the accepted static equivalent.)

## Deployment (GitHub Pages)

### One-time repository setup (Henry, in the browser)

1. GitHub → `hbraun87/resume` → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Domain — decided: Option A, `henrybraun.info`.** Henry is handling the DNS redirect himself; the agent only needs to give him the exact values below and verify the result.
   - **Option A — `henrybraun.info` (chosen).** In Settings → Pages → Custom domain, enter `henrybraun.info`. At the DNS provider: apex `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and `AAAA` → `2606:50c0:8000::153` … `8003::153`); `CNAME www → hbraun87.github.io`. Verify the domain under GitHub account Settings → Pages (prevents domain takeover). After the certificate is issued, tick **Enforce HTTPS**. Set repo variable `SITE_URL=https://henrybraun.info`, `BASE_PATH=/`. With an Actions-based deployment, a `CNAME` file in the repo is not required. *Agent: confirm these IPs against GitHub's current docs before telling Henry.*
   - **Option B — fallback while DNS propagates.** Site at `https://hbraun87.github.io/resume/`. Set `SITE_URL=https://hbraun87.github.io`, `BASE_PATH=/resume`.
   - Before switching DNS, find out where `henrybraun.info` is hosted today (`dig henrybraun.info +short`) and keep the old host live until the new site passes the launch checklist.

### `deploy.yml` (shape — agent pins current major versions)

```yaml
name: Deploy
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: false }

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      SITE_URL: ${{ vars.SITE_URL }}
      BASE_PATH: ${{ vars.BASE_PATH }}
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }                 # git dates/SHA for footer + lastmod
      - uses: actions/setup-node@v4
        with: { node-version: lts/*, cache: npm }
      - uses: actions/cache@v4                   # processed media + Astro image cache
        with:
          path: |
            .cache/media
            node_modules/.astro
          key: media-${{ hashFiles('src/assets/**') }}
          restore-keys: media-
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run check:static                # types, schema sync, lint, content checks
      - run: npm run build                       # media → astro build → redirects → résumé PDF
      - run: npm run check:dist                  # links (lychee), axe, Lighthouse CI budgets
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.d.outputs.page_url }} }
    steps:
      - id: d
        uses: actions/deploy-pages@v4
```

`ci.yml` runs the same `build` job on pull requests without deploying, and posts the Lighthouse report link as a PR comment. (The official `withastro/action` is a simpler alternative, but this site needs extra steps — Playwright, media cache, quality gates — so the explicit workflow is preferred.)

### Performance of the pipeline

Target: push-to-live under ~3 minutes for a content-only change. Media conversion is hash-cached, so only new/changed GIFs are processed.

## Security posture for a static site

- GitHub Pages cannot set custom response headers, so a strict **Content-Security-Policy** is delivered via `<meta http-equiv>`: `default-src 'self'; img-src 'self' https://i.ytimg.com data:; frame-src https://www.youtube-nocookie.com; script-src 'self'; style-src 'self' 'unsafe-inline'; base-uri 'self'; form-action 'none'` (adjust if inline scripts are needed — prefer hashes over `'unsafe-inline'` for scripts).
- `referrer` meta: `strict-origin-when-cross-origin`. External links: `rel="noopener"`.
- Dependabot for npm and Actions; `npm audit --omit=dev` in CI (fail on high/critical).
- Email address rendered as a normal `mailto:` (it is already public on the current site); no forms, no secrets anywhere in the repo.
