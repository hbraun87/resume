import { describe, expect, it } from 'vitest';
import { addExperience, draftEntry, slugify } from '../../src/lib/scaffold';
import { experienceSchema } from '../../src/lib/schema';

describe('slugify', () => {
  it.each([
    ['Until You Fall', 'until-you-fall'],
    ['Aventuras do Avião Vermelho', 'aventuras-do-aviao-vermelho'],
    ['  N.E.R.O.T.!  ', 'n-e-r-o-t'],
    ['!!!', ''],
  ])('%s → %s', (title, id) => {
    expect(slugify(title)).toBe(id);
  });
});

describe('draftEntry', () => {
  it('is a valid draft the schema accepts', () => {
    const entry = draftEntry('My New Game');
    expect(entry.visibility).toBe('draft');
    expect(experienceSchema.safeParse(entry).success).toBe(true);
  });
});

describe('addExperience', () => {
  it('appends a draft and returns its id', () => {
    const data = { experiences: [{ id: 'toren' }] };
    expect(addExperience(data, ' My New Game ')).toEqual({ ok: true, id: 'my-new-game' });
    expect(data.experiences).toHaveLength(2);
  });

  it('explains usage when the title is empty', () => {
    expect(addExperience({ experiences: [] }, '   ')).toEqual({
      ok: false,
      error: 'Usage: npm run new:experience -- "Project title"',
    });
  });

  it('refuses a title with nothing to make an id from', () => {
    const result = addExperience({ experiences: [] }, '???');
    expect(result).toMatchObject({
      ok: false,
      error: expect.stringMatching(/no letters or digits/),
    });
  });

  it('refuses a duplicate id', () => {
    const data = { experiences: [{ id: 'toren' }] };
    expect(addExperience(data, 'Toren')).toEqual({
      ok: false,
      error: 'An entry with id "toren" already exists.',
    });
    expect(data.experiences).toHaveLength(1);
  });
});
