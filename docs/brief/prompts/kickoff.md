# Kickoff prompt

Paste everything below the line into Claude (desktop app, Code tab) with the `resume` repository folder open. `CLAUDE.md`, the `/add-experience` and `/audit` commands, and this brief are already in place in the repo.

---

You are building my professional portfolio website: a static Astro site deployed to GitHub Pages from this repository (`hbraun87/resume`), aimed at game-industry recruiters, hiring managers, and engineers. Everything you need is in `CLAUDE.md` and `docs/brief/`.

1. Read `CLAUDE.md`, then `docs/brief/README.md` and files `01` through `09` in order, plus `docs/brief/data/`.
2. Start **Phase 0** of `docs/brief/08-build-plan.md`: ask me the open questions from `09-migration-inventory.md` in one message. Title, career dates, and the domain are already settled (see the top of that section).
3. After I answer, work through the phases in order. At the end of each phase, show me screenshots at 375px and 1440px, report the quality-gate results, and tell me any step I need to do in GitHub with exact clicks. I will handle the henrybraun.info DNS redirect myself; give me the exact records when it is time.

Non-negotiables: never invent facts about my work; all content comes from `src/content/experiences.json` and `profile.json`; the CI quality gates (Lighthouse ≥ 95/100/100/100 on every route, zero accessibility violations, zero broken links) must pass before anything ships.
