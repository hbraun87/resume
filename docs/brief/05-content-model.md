# 05 — Content model

Two files hold every word and media reference on the site:

- `src/content/experiences.json` — projects, games, tools, and research (anything you want to *showcase*).
- `src/content/profile.json` — who you are: headline, bio, career roles, skills, education, links.

Both are validated at build time (Zod) and in VS Code as you type (JSON Schema). Seeded versions migrated from henrybraun.info are in `data/` of this brief.

---

## Adding a new experience (the whole workflow)

1. Put the media in a folder named after the new entry's `id`:
   `src/assets/projects/my-new-game/` → `cover.jpg`, `01.png`, `combat.gif` …
2. Open `src/content/experiences.json` and add an object to the `experiences` array (copy the template below, or run `npm run new:experience -- "My New Game"` which inserts it for you).
3. Fill in the fields. VS Code autocompletes field names and flags mistakes in red.
4. `npm run dev` to preview at http://localhost:4321 (optional).
5. Commit and push to `main`. GitHub Actions validates, builds, checks quality, and deploys. Live in ~2–3 minutes.

If something is wrong (missing image, bad date, missing alt text), the build fails with a message that names the entry and field — nothing broken ever reaches the live site.

Or ask Claude: `/add-experience` and describe the project; it will draft the entry, ask for missing facts, and place your media.

### Minimal template

```json
{
  "id": "my-new-game",
  "title": "My New Game",
  "category": "game",
  "tier": "selected",
  "status": "shipped",
  "visibility": "public",
  "studio": "Studio Name",
  "role": "Lead Gameplay Engineer",
  "period": { "start": "2026-01" },
  "platforms": ["Meta Quest", "PC VR"],
  "engine": "Unity",
  "summary": "One or two sentences, under 200 characters, that a recruiter understands.",
  "highlights": [
    "Built the X system that enabled Y, shipped on Z."
  ],
  "cover": { "src": "cover.jpg", "alt": "Player parrying a sword strike in a neon arena" },
  "media": [
    { "type": "youtube", "id": "dQw4w9WgXcQ", "title": "Launch trailer" },
    { "type": "image", "src": "01.png", "alt": "Combo tuning tool in the Unity editor", "caption": "Designer-facing combo tuning tool I built." },
    { "type": "gif", "src": "parry.gif", "alt": "Slow-motion parry window visualization", "caption": "Parry window debug view." }
  ],
  "links": [{ "kind": "steam", "label": "Steam", "url": "https://store.steampowered.com/app/000000/" }]
}
```

---

## `experiences.json` — field reference

Top level:

```json
{
  "$schema": "./experience.schema.json",
  "experiences": [ /* entries */ ]
}
```

| Field | Type | Req. | Rules / notes |
|---|---|---|---|
| `id` | string | ✔ | kebab-case, unique, becomes the URL `/work/<id>/` and the media folder name. Never change after publishing (add the old one to `legacyPaths` if you must). |
| `title` | string | ✔ | Official title spelling. |
| `subtitle` | string | | e.g., "Localization & porting". |
| `category` | enum | ✔ | `game` · `prototype` · `tool` · `research` · `jam` · `other` |
| `tier` | enum | ✔ | `featured` (full case study) · `selected` (short page) · `archive` (table row) |
| `status` | enum | ✔ | `shipped` · `released-early-access` · `in-development` · `prototype` · `unreleased` · `published` (research) |
| `visibility` | enum | ✔ | `public` · `hidden` (finished, fully validated, kept off the site until switched back) · `draft` (validated but never published) |
| `order` | integer | | Manual sort within tier; lower first. Default: newest `period.start` first. |
| `studio` | string | | Studio where the work was done. |
| `client` | string | | Partner/IP holder (e.g., "Google", "LEGO", "Cartoon Network"). |
| `role` | string | ✔ | Henry's title on the project. |
| `responsibilities` | string[] | | Short tags: "Gameplay", "Systems", "Optimization", "Tech direction", "Porting", "Localization". Drives filters. |
| `period.start` | `YYYY` or `YYYY-MM` | recommended | Required by `profile.roles`; optional on experiences because most migrated entries have no verified dates yet. When absent, sorting uses `order`. |
| `period.end` | `YYYY` / `YYYY-MM` / `"present"` | | Omit for single-point items. |
| `platforms` | string[] | | Use canonical names: "Meta Quest", "PC VR", "PlayStation VR", "Google Daydream", "Gear VR", "iOS", "Android", "PC", "Web". |
| `engine` | string | | "Unity", "Unreal Engine", "Custom", … |
| `tech` | string[] | | Languages, SDKs, services: "C#", "C++", "ARCore", "ARKit", "Photon", "Google Cloud" … |
| `teamSize` | integer | | Team size at peak, if known. |
| `tags` | string[] | | Free filters: "VR", "AR", "Mobile", "Licensed IP", "Education", "Leadership". |
| `summary` | string | ✔ | ≤ 200 chars, plain text. Used on cards, meta description, résumé. |
| `highlights` | string[] | ✔ (featured/selected) | 2–4 impact bullets, ≤ 25 words each, start with a verb. Light Markdown allowed (`*italic*`, `**bold**`, links). |
| `metrics` | `{label, value, note?}[]` | | Big-number callouts, e.g. `{ "label": "Frame time", "value": "−5 ms" }`. Only verified numbers. |
| `awards` | `{name, year?, url?}[]` | | |
| `caseStudy` | object | ✔ for `featured` | `{ challenge, contributions[], deepDive?, outcome }` — Markdown strings (see below). |
| `cover` | `{src, alt}` | ✔ (optional for `research`) | 16:9 recommended, ≥ 1600px wide. Research entries without a figure render as text-only rows. |
| `coverLoop` | `{src}` | | GIF or MP4, 3–5 s, plays on card hover/focus. |
| `media` | Media[] | | Ordered; first YouTube item becomes the hero on featured pages. |
| `links` | `{kind, label, url}[]` | | `kind`: `steam` · `meta` · `app-store` · `google-play` · `website` · `press` · `paper` · `doi` · `video` · `repo` · `talk` · `other`. |
| `publication` | object | for `research` | `{ venue, year, authors[], abstract }` |
| `legacyPaths` | string[] | | Old URLs to redirect here, e.g. `"/projects/untilyoufall.html"`. |

### `caseStudy` object

```json
"caseStudy": {
  "challenge": "One paragraph: problem + constraints.",
  "contributions": [
    { "heading": "Combat feel", "body": "What I built and why (Markdown).", "media": ["parry.gif"] }
  ],
  "deepDive": "Optional long-form Markdown: architecture, trade-offs, profiling.",
  "outcome": "Results, reception, reuse."
}
```

`contributions[].media` references items in this entry's `media[]` by `src` (or YouTube `id`) to place them inline next to the text; items not referenced inline go to the gallery.

### Media items

```jsonc
{ "type": "youtube", "id": "S1zZHy7_BFg", "title": "Launch trailer", "start": 12, "poster": "trailer-poster.jpg" }
{ "type": "image",   "src": "01.png", "alt": "…", "caption": "…", "credit": "© Schell Games" }
{ "type": "gif",     "src": "parry.gif", "alt": "…", "caption": "…" }          // auto-converted to looping video
{ "type": "video",   "src": "combo.mp4", "alt": "…", "caption": "…", "loop": true }  // self-hosted clip
```

Rules (enforced by the schema/build):
- `youtube.id` must match `^[A-Za-z0-9_-]{11}$`. If you paste a full URL (`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`), the build extracts the ID and warns you to tidy it.
- `image`/`gif`/`video` require `alt` (non-empty) and a file that exists in the entry's asset folder.
- Allowed image formats: jpg, jpeg, png, webp, avif. GIF only as `type: "gif"`. Self-hosted video: mp4/webm ≤ 15 MB (larger → upload to YouTube).
- `title` on YouTube items is required (accessible name of the play button).

---

## `profile.json` — field reference

| Field | Notes |
|---|---|
| `name`, `headline`, `pitch` | Hero content. `headline` ≈ job title; `pitch` ≈ one sentence. |
| `location`, `availability` | e.g., "Pittsburgh, PA · Open to remote". |
| `email`, `links[]` | LinkedIn, GitHub, Maned Wolf Games, etc. |
| `portrait` | `{src, alt}` in `src/assets/profile/`. |
| `bio` | Markdown, About page. |
| `pillars[]` | `{title, body, proof}` where `proof` is an experience `id`. |
| `credits[]` | Text for the credits strip, in display order. |
| `roles[]` | `{company, title, start, end?, location?, summary?, highlights[]}` — career timeline + résumé. |
| `skills` | `{ engines[], languages[], platforms[], practices[] }` |
| `education[]` | `{institution, degree, start?, end?, notes?}` |
| `languages[]` | Spoken languages. |
| `resume` | `{ pdfFileName, includeTiers: ["featured","selected"] }` |

---

## Validation and guard rails

- **Build-time (Zod):** types, enums, required fields, regex for ids/dates, cross-field rules (featured ⇒ `caseStudy` and ≥ 1 media; research ⇒ `publication`; `period.end ≥ period.start`).
- **Content checks (`scripts/check-content.mjs`):** unique ids; every media file exists for public entries (warning only for drafts); no unreferenced files in `src/assets/projects/<id>/` (warning); no `TODO`, `TBD`, `[N]` placeholders or `_notes` keys in public content (entries or profile); images ≥ 1200px wide for covers; GIF ≤ 25 MB source.
- **Editor:** `.vscode/settings.json` maps `experience.schema.json` → `src/content/experiences.json`; the `$schema` key does the same in other editors.
- **Schema drift:** `npm run schema` regenerates the JSON Schema from Zod; CI fails if the committed file is stale.
