// The editor-facing JSON Schema for experiences.json, generated from the Zod
// schema so the two can never drift (scripts/gen-schema.mjs writes or verifies it).
import { z } from 'zod';
import { experiencesFileSchema } from './schema.ts';

export function experiencesJsonSchema(): string {
  const schema = {
    ...z.toJSONSchema(experiencesFileSchema, { io: 'input', unrepresentable: 'any' }),
    title: 'Henry Braun portfolio experiences',
    description: 'Generated from src/lib/schema.ts by `npm run schema`. Do not edit by hand.',
  };
  return `${JSON.stringify(schema, null, 2)}\n`;
}
