// Generates src/content/experience.schema.json from the Zod schema in
// src/lib/schema.ts. With --verify, fails if the committed file is stale.
import { readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { experiencesFileSchema } from '../src/lib/schema.ts';

const target = new URL('../src/content/experience.schema.json', import.meta.url);
const schema = {
  ...z.toJSONSchema(experiencesFileSchema, { io: 'input', unrepresentable: 'any' }),
  title: 'Henry Braun portfolio experiences',
  description: 'Generated from src/lib/schema.ts by `npm run schema`. Do not edit by hand.',
};
const json = `${JSON.stringify(schema, null, 2)}\n`;

if (process.argv.includes('--verify')) {
  const current = await readFile(target, 'utf8').catch(() => '');
  if (current !== json) {
    console.error('experience.schema.json is out of date. Run `npm run schema` and commit it.');
    process.exit(1);
  }
  console.log('experience.schema.json is up to date.');
} else {
  await writeFile(target, json);
  console.log('Wrote src/content/experience.schema.json');
}
