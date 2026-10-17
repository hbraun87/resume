# CLAUDE.md — Agent rules for the henrybraun.info portfolio

You are building and maintaining Henry Braun's professional portfolio: a static Astro site deployed to GitHub Pages from `hbraun87/resume`. The full brief lives in `docs/brief/`. Read `docs/brief/README.md` and files `01`–`09` before writing code. When this file and the brief disagree, this file wins; when the brief and Henry disagree, Henry wins.

## Prime directives

1. **The site is the proof.** Every visitor — recruiter, studio head, engineer — should conclude "this person ships high-quality work." Craft, speed, and correctness are features. Never trade them for decoration.
2. **Content is data.** All portfolio content lives in `src/content/experiences.json` and `src/content/profile.json`. No project text, titles, dates, or media references hard-coded in components. If a component needs a new kind of content, extend the schema first.
3. **Zero-JS by default.** Pages render as static HTML + CSS. JavaScript only ships for interaction that cannot be done in CSS (video facade activation, lightbox, filtering, dev console). Every script is lazy, small, and progressively enhances working HTML.
4. **Quality gates are law.** Do not mark a milestone done, and do not push to `main`, unless `npm run check` passes locally (types, schema, lint, build, links, a11y, Lighthouse budgets). Never weaken a gate to make it pass; fix the cause. If a gate is genuinely wrong, explain why and ask Henry.
5. **Never invent facts about Henry.** Titles, dates, metrics, team sizes, awards, and claims of impact come only from `docs/brief/09-migration-inventory.md`, the current site (henrybraun.info), his LinkedIn profile, or Henry himself. Unknown values stay `null`/absent and are listed in `docs/TODO-content.md`. Placeholder copy must be visibly marked `TODO:` and must never reach production (a build check enforces this).
6. **Protect personal data.** Publish only the email address and links in `profile.json`. Never publish Henry's phone number (it appears in his LinkedIn export) or any other private contact detail.
7. **Respect NDAs and IP.** Unreleased or confidential work is `"visibility": "draft"` until Henry confirms it can be public. Do not use third-party logos or key art unless Henry confirms he has the right to; prefer his own captures and text credits.

## Working agreement

- Work in the phases of `docs/brief/08-build-plan.md`, in order. Finish each phase's acceptance criteria before starting the next. Commit in small, conventional commits (`feat:`, `fix:`, `content:`, `perf:`, `a11y:`, `ci:`, `docs:`).
- At the start of the build, ask Henry the **Open questions** in `09-migration-inventory.md` in one batch. Proceed with sensible defaults (marked in the brief) for anything unanswered, and record what you assumed.
- When you make a non-obvious decision, add a short entry to `docs/decisions.md` (date, decision, why, alternatives).
- Before replying "done", run the site, look at it at 375px, 768px, and 1440px widths, in light and dark mode, and with `prefers-reduced-motion: reduce`. Fix what looks wrong.
- Keep dependencies few and mainstream. Justify every new runtime dependency in `docs/decisions.md`. Pin versions via the lockfile.
- Use the current stable major versions of Astro, Node LTS, and GitHub Actions at build time; check official docs rather than relying on memory for APIs that change (Astro content collections, `withastro/action`, `actions/deploy-pages`).

## Hard rules for code

- TypeScript `strict`. No `any` without a comment explaining why.
- All internal URLs go through a single `url()` helper that respects `import.meta.env.BASE_URL`, so the site works both at `https://hbraun87.github.io/resume/` and at a custom domain root.
- Every image has meaningful `alt` text (from JSON). Decorative images use `alt=""`. Every video has a title. Missing alt text fails the build.
- Every interactive element is keyboard-reachable with a visible focus style. No `div` buttons.
- No layout shift: every media element reserves its aspect ratio before load.
- Motion respects `prefers-reduced-motion`. Autoplaying loops pause under reduced motion and when off-screen.
- No third-party requests on initial page load (no analytics, fonts, or YouTube until the visitor clicks play). Fonts are self-hosted and subset.

## Content rules (summary of `02-content-strategy.md`)

- Lead with impact; follow with technical depth. Recruiters read the top; engineers read the rest.
- Every featured project states clearly what **Henry personally** did, in first person, separate from what the team did.
- Prefer specific verbs and numbers ("cut frame time from 14 ms to 9 ms on Quest") over adjectives ("optimized performance"). If Henry has no number, describe the concrete mechanism instead — never fabricate one.
- American English. Sentence case headings. No exclamation marks in professional copy.

## Useful commands (create these in Phase 1)

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build into `dist/` (includes media processing) |
| `npm run check` | Everything CI runs: types, schema sync, lint, build, links, axe, Lighthouse |
| `npm run new:experience -- "Title"` | Scaffold a new entry in `experiences.json` |
| `npm run schema` | Regenerate `experience.schema.json` from the Zod schema |

Slash commands available in `.claude/commands/`: `/add-experience`, `/audit`.
