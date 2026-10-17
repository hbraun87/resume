// Scaffolds a new entry in src/content/experiences.json and its media folder.
// Usage: npm run new:experience -- "My New Game"
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new:experience -- "Project title"');
  process.exit(1);
}

const id = title
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const file = new URL('../src/content/experiences.json', import.meta.url);
const data = JSON.parse(readFileSync(file, 'utf8'));
if (data.experiences.some((entry) => entry.id === id)) {
  console.error(`An entry with id "${id}" already exists.`);
  process.exit(1);
}

// Starts as a draft so a half-filled entry can never reach the live site.
data.experiences.push({
  id,
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
});
writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
mkdirSync(new URL(`../src/assets/projects/${id}/`, import.meta.url), { recursive: true });

console.log(`Added "${title}" as a draft with id "${id}".`);
console.log(
  `Put its media in src/assets/projects/${id}/, fill in the fields, then set "visibility": "public".`,
);
