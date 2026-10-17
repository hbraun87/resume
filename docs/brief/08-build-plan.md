# 08 — Build plan

Work through the phases in order. Each phase ends with its acceptance criteria met, `npm run check` green (from Phase 2 on), and a short summary to Henry with screenshots at 375px and 1440px.

## Phase 0 — Kickoff (no code)

- Read `CLAUDE.md` and `docs/brief/*`.
- Ask Henry the **Open questions** from `09-migration-inventory.md` in one message. Record answers in `docs/decisions.md`; for anything unanswered, use the brief's defaults and list them.
- Check whether `hbraun87.github.io` already has a user site with `henrybraun.info` as its custom domain (it would conflict), and note where `henrybraun.info` points today (`dig henrybraun.info +short`). Henry is doing the DNS change himself; give him the exact records from `04` when he is ready.

**Done when:** decisions are logged and Henry has confirmed (or defaulted) headline, featured list, and what Bad Robot / Twin Suns work can be shown.

## Phase 1 — Foundation

- Scaffold Astro (current stable) with TypeScript strict, ESLint, Prettier, Vitest, Playwright.
- `astro.config.mjs` with env-driven `SITE_URL`/`BASE_PATH`, trailing slashes, sitemap.
- `src/lib/url.ts` + unit tests. Tokens, reset, global CSS; self-hosted fonts.
- `Base` layout: head (meta, CSP, theme script), header, footer, skip link.
- `deploy.yml` + `ci.yml`; enable Pages (Henry does the Settings step — give him exact clicks).
- Deploy a "hello" page with real header/footer to the live URL.

**Done when:** pushing to `main` deploys automatically; the page works at the configured base path; Lighthouse on that page is 100/100/100/100.

## Phase 2 — Content layer & migration

- Implement Zod schemas in `src/lib/schema.ts` per `05`; collections in `src/content.config.ts`; `gen-schema.mjs` (+ `--verify`), `check-content.mjs`, `new-experience.mjs`.
- Copy `docs/brief/data/*.json` into `src/content/` as the starting content.
- **Migrate media from the current site**: for every project page `https://henrybraun.info/projects/<legacy>.html`, collect the cover (`/img/projs/<legacy>.png`), full-size gallery images (`/img/<legacy>/<n>.png`, not the `_thumb` versions), and any YouTube embed IDs. Save into `src/assets/projects/<id>/`, add to `media[]`, write descriptive alt text (ask Henry when unsure of what an image shows). Same for research figures from `/research.html` and the portrait `/img/henry.png`.
- Write a migration report in `docs/TODO-content.md`: per project, what was found, what is missing (video, metrics, dates, team size).
- `.vscode/settings.json` schema mapping.

**Done when:** build validates all entries; every public entry has a cover; the migration report exists; deliberately breaking a field produces a clear error.

## Phase 3 — Media components

- `YouTube` facade (build-time poster download), `LoopVideo` + controller, `Figure`, `Gallery`, `Lightbox`.
- `scripts/media.mjs` with ffmpeg-static and hash cache; CI cache step.
- Styleguide page showing every component in every state.

**Done when:** a test page with one of each media type scores ≥ 95 performance mobile with zero third-party requests before click; reduced-motion and keyboard behaviors verified by Playwright.

## Phase 4 — Pages

- Home (all sections from `02`), Work index with filters (no-JS fallback), project page templates for `featured` and `selected`, Research, About, 404.
- Résumé page + PDF generation; header Résumé button links to the PDF.
- OG image generation; JSON-LD builders; legacy redirects.

**Done when:** every page in the IA exists with real content; résumé PDF is 2 pages, ATS-parsable text; old URLs (e.g., `/projects/untilyoufall.html`) land on the right new page.

## Phase 5 — Polish & excellence

- Motion pass (entrances, hover loops, corner brackets, view transitions if budget allows).
- Dev console.
- Full quality gates in CI: Lighthouse CI budgets on all routes, axe both themes, lychee, html-validate, size-limit.
- Public README with screenshots and score badges.
- Manual checks: VoiceOver + keyboard-only walkthrough; real phone on cellular; Safari, Chrome, Firefox; print the résumé page.

**Done when:** all budgets in `07` pass on every route in CI, and the launch checklist below is complete.

## Phase 6 — Content excellence (with Henry)

- For each featured project, interview Henry (one project at a time, ≤ 8 questions) to fill: personal contributions, the hardest technical problem, how he solved it, numbers, team size, what was reused afterwards. Draft the case study; Henry approves before it goes public.
- Ask for new media where it would prove a contribution (profiler captures, tool screenshots, short GIFs of systems).

**Done when:** every featured case study is complete with no placeholders and Henry has approved it.

## Phase 7 — Launch

- Henry points `henrybraun.info` at GitHub Pages (records in `04`). The agent then verifies DNS, confirms the certificate, enforces HTTPS, sets `SITE_URL=https://henrybraun.info` and `BASE_PATH=/`, checks redirects and canonical URLs, and walks Henry through submitting the sitemap in Google Search Console.
- Update LinkedIn and résumé links to the new site.

---

## Launch checklist

**Recruiter test (phone, 30 s):**
- [ ] Name, title, location/remote, and recognizable credits visible without scrolling.
- [ ] Résumé PDF and email reachable in one tap from every page.

**Hiring-manager test (3 min):**
- [ ] Featured projects state Henry's personal role and contributions explicitly.
- [ ] Every featured project has video proof and 2–4 impact bullets.
- [ ] No placeholder text, no typos (spell-check pass), consistent title spellings.

**Technical:**
- [ ] Lighthouse mobile ≥ 95 / 100 / 100 / 100 on every route; budgets green in CI.
- [ ] 0 axe violations (light + dark); keyboard and VoiceOver walkthrough done.
- [ ] 0 broken links; legacy URLs redirect; 404 page on-brand.
- [ ] OG previews correct on LinkedIn (Post Inspector) and Slack/Discord.
- [ ] Rich results test passes for Person and VideoObject.
- [ ] Works at base path and at custom domain; HTTPS enforced.
- [ ] Repo README polished; `main` protected; Dependabot on.

**Maintainability:**
- [ ] Henry adds a dummy project by editing JSON only, pushes, sees it live, then removes it.
- [ ] `/add-experience` and `/audit` commands work in Claude.
