import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { experiencesJsonSchema } from '../../src/lib/json-schema';

describe('experiencesJsonSchema', () => {
  it('matches the committed experience.schema.json', () => {
    expect(experiencesJsonSchema()).toBe(
      readFileSync('src/content/experience.schema.json', 'utf8'),
    );
  });
});
