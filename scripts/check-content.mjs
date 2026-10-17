// Content guard rails beyond the schema (docs/brief/05-content-model.md):
// unique ids, media files present, placeholders and private data kept out of
// public content. Errors fail the build; warnings are printed.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { experiencesFileSchema, profileSchema } from '../src/lib/schema.ts';

const root = new URL('../', import.meta.url);
const read = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const errors = [];
const warnings = [];

const experiencesResult = experiencesFileSchema.safeParse(read('src/content/experiences.json'));
const profileResult = profileSchema.safeParse(read('src/content/profile.json'));
for (const [file, result] of [
  ['experiences.json', experiencesResult],
  ['profile.json', profileResult],
]) {
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${file} → ${issue.path.join('.')}: ${issue.message}`);
    }
  }
}

const PLACEHOLDER = /\bTODO\b|\bTBD\b|\[N\]|lorem ipsum/i;
// A North American phone number; the LinkedIn export has one that must never ship.
const PHONE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;

function scanStrings(value, where) {
  if (typeof value === 'string') {
    if (PLACEHOLDER.test(value)) errors.push(`${where}: placeholder text in public content`);
    if (PHONE.test(value)) errors.push(`${where}: looks like a phone number; never publish it`);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => scanStrings(item, `${where}[${index}]`));
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key.startsWith('_'))
        errors.push(`${where}.${key}: working notes must not be in content files`);
      scanStrings(item, `${where}.${key}`);
    }
  }
}

if (profileResult.success) scanStrings(read('src/content/profile.json'), 'profile.json');

if (experiencesResult.success) {
  const seen = new Set();
  for (const entry of experiencesResult.data.experiences) {
    const where = `experiences.json → ${entry.id}`;
    if (seen.has(entry.id)) errors.push(`${where}: duplicate id`);
    seen.add(entry.id);
    const isPublic = entry.visibility === 'public';
    if (isPublic) scanStrings(entry, where);

    const folder = new URL(`src/assets/projects/${entry.id}/`, root);
    const files = existsSync(folder) ? readdirSync(folder) : [];
    const referenced = new Set();
    const need = (src, field) => {
      referenced.add(src);
      if (!files.includes(src)) {
        const message = `${where} → ${field} "${src}" not found in src/assets/projects/${entry.id}/`;
        (isPublic ? errors : warnings).push(message);
      }
    };
    if (entry.cover) need(entry.cover.src, 'cover.src');
    else if (isPublic && entry.tier === 'featured')
      warnings.push(`${where}: featured entry has no cover`);
    if (entry.coverLoop) need(entry.coverLoop.src, 'coverLoop.src');
    entry.media?.forEach((item, index) => {
      if (item.type === 'youtube') {
        if (item.poster) need(item.poster, `media[${index}].poster`);
      } else {
        need(item.src, `media[${index}].src`);
      }
    });
    for (const file of files) {
      if (!referenced.has(file) && !file.startsWith('.')) {
        warnings.push(`${where}: src/assets/projects/${entry.id}/${file} is not used`);
      }
    }
  }
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`\nContent check failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`Content check passed (${warnings.length} warning(s)).`);
