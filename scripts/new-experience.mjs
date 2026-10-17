// Scaffolds a new entry in src/content/experiences.json and its media folder.
// Usage: npm run new:experience -- "My New Game"
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { addExperience } from '../src/lib/scaffold.ts';

const file = new URL('../src/content/experiences.json', import.meta.url);
const data = JSON.parse(readFileSync(file, 'utf8'));
const title = process.argv.slice(2).join(' ');
const result = addExperience(data, title);
if (!result.ok) {
  console.error(result.error);
  process.exit(1);
}

writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
mkdirSync(new URL(`../src/assets/projects/${result.id}/`, import.meta.url), { recursive: true });

console.log(`Added "${title.trim()}" as a draft with id "${result.id}".`);
console.log(
  `Put its media in src/assets/projects/${result.id}/, fill in the fields, then set "visibility": "public".`,
);
