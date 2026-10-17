// Logic behind `npm run new:experience`; scripts/new-experience.mjs does the file I/O.

/** Turns a project title into a kebab-case id: "Ação Rápida!" → "acao-rapida". */
export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * A new entry for a title. It starts as a draft so a half-filled entry can
 * never reach the live site; the template text tells the author what to write.
 */
export function draftEntry(title: string) {
  return {
    id: slugify(title),
    title,
    category: 'game',
    tier: 'selected',
    status: 'shipped',
    visibility: 'draft',
    role: 'Your role on the project',
    summary: 'One or two sentences, under 200 characters, that a recruiter understands.',
    highlights: ['Start with a verb: what you built or led, and what changed because of it.'],
    media: [],
    links: [],
  };
}

/** Adds a draft entry to the parsed experiences file, or explains why it cannot. */
export function addExperience(
  data: { experiences: { id: string }[] },
  rawTitle: string,
): { ok: true; id: string } | { ok: false; error: string } {
  const title = rawTitle.trim();
  if (!title) return { ok: false, error: 'Usage: npm run new:experience -- "Project title"' };
  const entry = draftEntry(title);
  if (!entry.id) return { ok: false, error: `"${title}" has no letters or digits to make an id.` };
  if (data.experiences.some((existing) => existing.id === entry.id)) {
    return { ok: false, error: `An entry with id "${entry.id}" already exists.` };
  }
  data.experiences.push(entry);
  return { ok: true, id: entry.id };
}
