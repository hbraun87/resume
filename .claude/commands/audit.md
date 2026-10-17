---
description: Run every quality gate and report what is failing and how to fix it
---

Audit the portfolio against `docs/brief/07-technical-excellence.md` and the launch checklist in `docs/brief/08-build-plan.md`.

1. Run `npm run check` (types, schema sync, lint, content checks, build, links, Playwright + axe, Lighthouse CI). Do not change any thresholds.
2. Summarize results as a table: gate · status · worst offender (route / file) · measured value vs budget.
3. Content audit of `src/content/*.json`:
   - Public entries containing `TODO`, `TBD`, `[N]`, or bracketed placeholders.
   - Featured entries without a YouTube or video item, without 2–4 highlights, or whose highlights lack a number or concrete mechanism.
   - Spelling of official titles; typos; summaries over 200 characters; alt text that is generic ("screenshot 1", "key art" on gallery images).
4. Visual audit: run the site, screenshot Home and one featured project at 375px and 1440px in both themes, and note anything misaligned, clipped, low-contrast, or inconsistent with `03-design-system.md`.
5. Report the top five fixes in priority order, with the exact change for each. Ask before applying fixes that change copy; fix purely technical issues directly, re-run the failing gate, and confirm it passes.
