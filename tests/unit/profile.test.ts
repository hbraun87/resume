import { describe, expect, it } from 'vitest';
import profile from '../../src/content/profile.json';
import { guilds, paragraphs, questLog, yearSpan } from '../../src/lib/profile';
import type { Profile } from '../../src/lib/schema';

type Role = Profile['roles'][number];
const role = (company: string, title: string, start: string, end?: string): Role => ({
  company,
  title,
  start,
  ...(end ? { end } : {}),
  highlights: [],
});

describe('yearSpan', () => {
  it('shows years only, collapsing single-year spans', () => {
    expect(yearSpan('2015-04', '2021-10')).toBe('2015–2021');
    expect(yearSpan('2013-07', '2013-08')).toBe('2013');
    expect(yearSpan('2021-04', 'present')).toBe('2021–present');
    expect(yearSpan('2020')).toBe('2020');
  });
});

describe('questLog', () => {
  it('splits current roles from earlier employers, one line per employer', () => {
    const log = questLog([
      role('Studio A', 'Manager', '2026-06', 'present'),
      role('Studio A', 'Lead', '2024-01', '2026-06'),
      role('Studio B', 'Senior', '2020-08', '2021-10'),
      role('Studio C', 'Freelance', '2013-04'),
      role('Studio B', 'Engineer', '2015-04', '2020-08'),
      role('Studio B', 'Intern', '2016-01', '2016-02'),
    ]);
    expect(log.active).toEqual([{ title: 'Manager', company: 'Studio A', years: '2026–present' }]);
    expect(log.completed).toEqual([
      { title: 'Senior', company: 'Studio B', years: '2015–2021' },
      { title: 'Freelance', company: 'Studio C', years: '2013' },
    ]);
  });

  it('matches the facts in profile.json', () => {
    const log = questLog(profile.roles);
    expect(log.active.map((q) => q.company)).toEqual(['Bad Robot Games', 'Maned Wolf Games']);
    expect(log.completed.find((q) => q.company === 'Schell Games')).toEqual({
      title: 'Senior Engineer',
      company: 'Schell Games',
      years: '2015–2021',
    });
  });
});

describe('guilds', () => {
  it('lists current companies once each', () => {
    expect(
      guilds([
        role('A', 'x', '2020', 'present'),
        role('A', 'y', '2021', 'present'),
        role('B', 'z', '2010', '2012'),
      ]),
    ).toEqual(['A']);
  });
});

describe('paragraphs', () => {
  it('splits on blank lines and drops empty ones', () => {
    expect(paragraphs('One.\n\nTwo.\n  \n\nThree.\n\n')).toEqual(['One.', 'Two.', 'Three.']);
  });
});
