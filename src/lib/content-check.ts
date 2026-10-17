// Content guard rails beyond the schema (docs/brief/05-content-model.md):
// unique ids, media files present, placeholders and private data kept out of
// public content. scripts/check-content.mjs runs this against the real files.
import { experiencesFileSchema, profileSchema, type Experience } from './schema.ts';

export interface ContentReport {
  errors: string[];
  warnings: string[];
}

/** Lists the files in an entry's media folder; empty when the folder is missing. */
export type ListMediaFiles = (id: string) => string[];

const PLACEHOLDER = /\bTODO\b|\bTBD\b|\[N\]|lorem ipsum/i;
// A North American phone number; the LinkedIn export has one that must never ship.
const PHONE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;

/** Flags placeholder text, phone numbers and `_` working-note keys anywhere in a value. */
export function scanStrings(value: unknown, where: string, errors: string[]): void {
  if (typeof value === 'string') {
    if (PLACEHOLDER.test(value)) errors.push(`${where}: placeholder text in public content`);
    if (PHONE.test(value)) errors.push(`${where}: looks like a phone number; never publish it`);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => scanStrings(item, `${where}[${index}]`, errors));
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key.startsWith('_'))
        errors.push(`${where}.${key}: working notes must not be in content files`);
      scanStrings(item, `${where}.${key}`, errors);
    }
  }
}

function checkMedia(entry: Experience, files: string[], report: ContentReport): void {
  const where = `experiences.json → ${entry.id}`;
  const isPublic = entry.visibility === 'public';
  const referenced = new Set<string>();
  const need = (src: string, field: string) => {
    referenced.add(src);
    if (!files.includes(src)) {
      const message = `${where} → ${field} "${src}" not found in src/assets/projects/${entry.id}/`;
      (isPublic ? report.errors : report.warnings).push(message);
    }
  };
  if (entry.cover) need(entry.cover.src, 'cover.src');
  else if (isPublic && entry.tier === 'featured')
    report.warnings.push(`${where}: featured entry has no cover`);
  if (entry.coverLoop) {
    need(entry.coverLoop.src, 'coverLoop.src');
    if (isPublic)
      report.errors.push(`${where} → coverLoop: needs the media pipeline (docs/decisions.md)`);
  }
  entry.media?.forEach((item, index) => {
    if ((item.type === 'gif' || item.type === 'video') && isPublic) {
      report.errors.push(
        `${where} → media[${index}]: ${item.type} files need the media pipeline (docs/decisions.md); use an image or YouTube for now`,
      );
    }
    if (item.type !== 'youtube') need(item.src, `media[${index}].src`);
    else if (item.poster) need(item.poster, `media[${index}].poster`);
  });
  for (const file of files) {
    if (!referenced.has(file) && !file.startsWith('.')) {
      report.warnings.push(`${where}: src/assets/projects/${entry.id}/${file} is not used`);
    }
  }
}

/** Validates both content files and everything the schema cannot see on its own. */
export function checkContent(
  experiences: unknown,
  profile: unknown,
  listMediaFiles: ListMediaFiles,
): ContentReport {
  const report: ContentReport = { errors: [], warnings: [] };
  const experiencesResult = experiencesFileSchema.safeParse(experiences);
  const profileResult = profileSchema.safeParse(profile);
  for (const [file, result] of [
    ['experiences.json', experiencesResult],
    ['profile.json', profileResult],
  ] as const) {
    for (const issue of result.error?.issues ?? []) {
      report.errors.push(`${file} → ${issue.path.join('.')}: ${issue.message}`);
    }
  }

  if (profileResult.success) scanStrings(profile, 'profile.json', report.errors);

  if (experiencesResult.success) {
    const seen = new Set<string>();
    for (const entry of experiencesResult.data.experiences) {
      const where = `experiences.json → ${entry.id}`;
      if (seen.has(entry.id)) report.errors.push(`${where}: duplicate id`);
      seen.add(entry.id);
      if (entry.visibility === 'public') scanStrings(entry, where, report.errors);
      checkMedia(entry, listMediaFiles(entry.id), report);
    }
  }
  return report;
}
