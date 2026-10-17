# Henry Braun — Portfolio Website Brief

This folder is the complete, agent-ready brief for building **henrybraun.info v2**: a static, data-driven portfolio that presents Henry Braun — Engineering Manager at Bad Robot Games, formerly Schell Games and Twin Suns, founder of Maned Wolf Games — to studio leads, recruiters, and engineers. The site must itself be a showcase of technical excellence.

It is written for Claude (desktop app, Code tab) as working context: goals, audience, content strategy, design system, architecture, data model, media pipeline, quality gates, a phased build plan, and Henry's career data already migrated into JSON.

---

## Where everything lives in this repo

```
resume/
├── CLAUDE.md                     # agent rules — loaded automatically by Claude; read first
├── .claude/commands/
│   ├── add-experience.md         # /add-experience — guided new-entry workflow
│   └── audit.md                  # /audit — run every quality gate and report
└── docs/brief/                   # ← you are here
    ├── README.md
    ├── 01-vision-and-audience.md … 09-migration-inventory.md
    ├── data/
    │   ├── experiences.json      # 36 entries: 22 projects + 14 research items, migrated
    │   ├── profile.json          # bio, full career timeline (LinkedIn), skills, education
    │   └── experience.schema.json  # JSON Schema → autocomplete + validation in VS Code
    └── prompts/
        └── kickoff.md            # paste this into Claude to start the build
```

## How to start the build

1. Clone the repo and open the folder in the Claude desktop app (Code tab):
   ```bash
   git clone https://github.com/hbraun87/resume.git
   ```
2. Paste the prompt from [`prompts/kickoff.md`](prompts/kickoff.md).
3. Answer the agent's kickoff questions ([`09` → Open questions](09-migration-inventory.md#open-questions-for-henry)). Title, career dates, and the domain are already settled.
4. When the agent reaches Phase 1, turn on GitHub Pages: **Settings → Pages → Source: GitHub Actions**. When you are ready, point `henrybraun.info` at GitHub Pages using the records in [`04` → Deployment](04-architecture.md#deployment-github-pages).

After launch, add new work by editing **one file**, `src/content/experiences.json` ([how](05-content-model.md#adding-a-new-experience-the-whole-workflow)), or by running `/add-experience` in Claude.

---

## Reading order (for the agent)

| # | File | What it decides |
|---|------|-----------------|
| — | [`CLAUDE.md`](../../CLAUDE.md) | Non-negotiable rules. Read first, obey always. |
| 01 | [`01-vision-and-audience.md`](01-vision-and-audience.md) | Positioning as an engineering manager who is still deeply technical; audiences; the 30-second test. |
| 02 | [`02-content-strategy.md`](02-content-strategy.md) | Research-backed site structure, case-study format, writing rules, project tiers, résumé. |
| 03 | [`03-design-system.md`](03-design-system.md) | Visual direction, tokens, typography, motion, components, page layouts. |
| 04 | [`04-architecture.md`](04-architecture.md) | Astro static site, repo layout, routing, GitHub Pages + `henrybraun.info`, redirects, security. |
| 05 | [`05-content-model.md`](05-content-model.md) | The JSON contract: every field, validation, and the add-an-experience workflow. |
| 06 | [`06-media-pipeline.md`](06-media-pipeline.md) | YouTube, images, and GIFs — storage, optimization, rendering. |
| 07 | [`07-technical-excellence.md`](07-technical-excellence.md) | Performance budgets, accessibility, SEO, privacy, CI quality gates, the dev console. |
| 08 | [`08-build-plan.md`](08-build-plan.md) | Phased milestones with acceptance criteria, and the launch checklist. |
| 09 | [`09-migration-inventory.md`](09-migration-inventory.md) | Verified career facts (site + LinkedIn), content to recover, open questions. |
| 10 | [`10-loading-screen-spec.md`](10-loading-screen-spec.md) | The home page experience and visual design: the game loading sequence, HUD, particle finale. Combined with 01–09 as described in `CLAUDE.md`. |

---

## The four requirements, and where each is met

| Requirement | Met by |
|---|---|
| **Add new experiences by editing a JSON file** | One file, `src/content/experiences.json`, validated at build time and in the editor. Bad data fails the build with a readable error instead of shipping a broken page. → [`05`](05-content-model.md) |
| **Embedded YouTube, images, and GIFs** | One `media[]` list per experience. YouTube loads only on click (privacy-friendly, zero cost until then); images become responsive AVIF/WebP; GIFs are converted to small looping videos at build time. → [`06`](06-media-pipeline.md) |
| **Static site on GitHub Pages** (`hbraun87/resume`) | Astro static output, deployed by GitHub Actions on every push to `main`, served at `henrybraun.info`. → [`04`](04-architecture.md) |
| **Anyone who sees it sees technical excellence** | Enforced, not hoped for: nothing deploys unless every page scores ≥ 95 mobile performance and 100 accessibility / best practices / SEO in Lighthouse, with zero accessibility violations and zero broken links. A `~` dev console shows the page's real performance numbers, like an in-game debug HUD. → [`07`](07-technical-excellence.md) |

---

## Definition of done

The site is done when every box in the [launch checklist](08-build-plan.md#launch-checklist) is ticked — in short:

- A recruiter on a phone sees **who Henry is, his current role, what he has shipped, and how to reach him** within 30 seconds.
- A hiring manager can open any featured project and see **what Henry led or built, how, and the result**, with video proof.
- Every page scores **≥ 95 Performance (mobile) and 100 Accessibility / Best Practices / SEO** in Lighthouse CI.
- Adding a project is **edit JSON → commit → live in about 2 minutes**, with zero code changes.
- Nothing private is published: email and public links only — never the phone number from the LinkedIn export.
