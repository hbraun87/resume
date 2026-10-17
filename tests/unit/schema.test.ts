import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  experienceSchema,
  experiencesFileSchema,
  parseYouTubeId,
  profileSchema,
} from '../../src/lib/schema';

const minimal = {
  id: 'my-new-game',
  title: 'My New Game',
  category: 'game',
  tier: 'archive',
  status: 'shipped',
  visibility: 'public',
  role: 'Programmer',
  summary: 'A short summary.',
};

describe('content files', () => {
  it('experiences.json matches the schema', () => {
    const data = JSON.parse(readFileSync('src/content/experiences.json', 'utf8'));
    expect(experiencesFileSchema.safeParse(data).success).toBe(true);
  });

  it('profile.json matches the schema', () => {
    const data = JSON.parse(readFileSync('src/content/profile.json', 'utf8'));
    expect(profileSchema.safeParse(data).success).toBe(true);
  });
});

describe('experienceSchema', () => {
  it('accepts the minimal template', () => {
    expect(experienceSchema.safeParse(minimal).success).toBe(true);
  });

  it('names the field when an enum is wrong', () => {
    const result = experienceSchema.safeParse({ ...minimal, tier: 'hero' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['tier']);
  });

  it('rejects ids that are not kebab-case', () => {
    const result = experienceSchema.safeParse({ ...minimal, id: 'My Game' });
    expect(result.error?.issues[0]?.message).toMatch(/kebab-case/);
  });

  it('requires alt text on images', () => {
    const result = experienceSchema.safeParse({
      ...minimal,
      media: [{ type: 'image', src: '01.png', alt: ' ' }],
    });
    expect(result.error?.issues[0]?.message).toMatch(/Alt text is required/);
  });

  it('requires a case study on public featured entries', () => {
    const result = experienceSchema.safeParse({
      ...minimal,
      tier: 'featured',
      highlights: ['Built it.'],
    });
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('caseStudy');
  });

  it('rejects an end date before the start date', () => {
    const result = experienceSchema.safeParse({
      ...minimal,
      period: { start: '2020-05', end: '2019' },
    });
    expect(result.error?.issues[0]?.message).toMatch(/before period.start/);
  });

  it('normalizes YouTube URLs to ids', () => {
    const result = experienceSchema.parse({
      ...minimal,
      media: [{ type: 'youtube', id: 'https://youtu.be/S1zZHy7_BFg', title: 'Trailer' }],
    });
    expect(result.media?.[0]).toMatchObject({ id: 'S1zZHy7_BFg' });
  });
});

describe('parseYouTubeId', () => {
  it.each([
    ['S1zZHy7_BFg', 'S1zZHy7_BFg'],
    ['https://www.youtube.com/watch?v=S1zZHy7_BFg&t=4', 'S1zZHy7_BFg'],
    ['https://www.youtube.com/embed/BbTIdBKVmeI', 'BbTIdBKVmeI'],
    ['https://youtube.com/shorts/BbTIdBKVmeI', 'BbTIdBKVmeI'],
    ['not a video', null],
  ])('%s → %s', (input, expected) => {
    expect(parseYouTubeId(input)).toBe(expected);
  });
});
