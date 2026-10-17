---
description: Add a new project, game, tool, or research item to the portfolio
argument-hint: "[project name or short description]"
---

Add a new entry to `src/content/experiences.json` for: $ARGUMENTS

Follow `docs/brief/05-content-model.md` and the writing rules in `docs/brief/02-content-strategy.md`.

1. **Gather facts first.** Ask Henry, in one message, only for what you cannot find yourself:
   - Title, studio, client, his role, dates, platforms, engine, team size, status (shipped / in development / prototype), visibility (public / draft — ask if it is under NDA).
   - What he personally built or led, the hardest problem, how he solved it, and any numbers.
   - Media: YouTube link(s), and where his images/GIFs are (attached files or a folder path).
   - Suggested tier (`featured` needs a full case study; `selected` needs 2–4 highlights; `archive` needs only a summary).
   If he gives a public store page or website, read it for spelling, dates, and platforms — but never treat it as a source for *his* contributions.

2. **Place media** in `src/assets/projects/<id>/` (kebab-case id from the title). Name files descriptively (`parry-window.gif`, not `IMG_0042.gif`). Look at each image and write specific alt text describing what it shows; write captions that say what it proves about Henry's work.

3. **Draft the entry**: summary ≤ 200 chars; highlights start with a verb, ≤ 25 words, "I" for his work and "we" for the team's; a `caseStudy` if featured. No invented metrics — if a number is missing, describe the mechanism, or leave it out and note it.

4. **Validate**: run `npm run check:static` and `npm run build`; fix any error. Run `npm run dev` and look at the new card and page at 375px and 1440px widths.

5. **Show Henry** the drafted copy and screenshots. Commit only after he approves, with message `content: add <title>`. Push to `main` only if he asks.

6. List any facts still missing in `docs/TODO-content.md`.
