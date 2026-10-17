// Runs the content guard rails in src/lib/content-check.ts against the real
// files. Errors fail the build; warnings are printed.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { checkContent } from '../src/lib/content-check.ts';

const root = new URL('../', import.meta.url);
const read = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const listMediaFiles = (id) => {
  const folder = new URL(`src/assets/projects/${id}/`, root);
  return existsSync(folder) ? readdirSync(folder) : [];
};

const { errors, warnings } = checkContent(
  read('src/content/experiences.json'),
  read('src/content/profile.json'),
  listMediaFiles,
);

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`\nContent check failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`Content check passed (${warnings.length} warning(s)).`);
