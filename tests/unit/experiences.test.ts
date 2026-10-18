import { describe, expect, it } from 'vitest';
import {
  entryPath,
  games,
  glyph,
  nextEntry,
  periodLabel,
  platformCounts,
  platformGroups,
  publicEntries,
  research,
} from '../../src/lib/experiences';
import type { Experience } from '../../src/lib/schema';

const make = (id: string, overrides: Partial<Experience> = {}): Experience => ({
  id,
  title: id,
  category: 'game',
  tier: 'selected',
  status: 'shipped',
  visibility: 'public',
  role: 'Engineer',
  summary: 'Summary.',
  ...overrides,
});

const entries = [
  make('b-game', { order: 2, platformGroup: 'vr' }),
  make('a-game', { order: 1, platformGroup: 'mobile' }),
  make('no-order', { platformGroup: 'vr' }),
  make('also-no-order', { category: 'jam', platformGroup: 'pc' }),
  make('hidden', { visibility: 'draft', order: 0 }),
  make('paper', { category: 'research', order: 100 }),
  make('tool', { category: 'tool' }),
];

describe('publicEntries', () => {
  it('drops drafts and sorts by order, then title', () => {
    expect(publicEntries(entries).map((e) => e.id)).toEqual([
      'a-game',
      'b-game',
      'paper',
      'also-no-order',
      'no-order',
      'tool',
    ]);
  });

  it('splits games from research', () => {
    expect(games(entries).map((e) => e.id)).toEqual([
      'a-game',
      'b-game',
      'also-no-order',
      'no-order',
    ]);
    expect(research(entries).map((e) => e.id)).toEqual(['paper']);
  });
});

describe('entryPath', () => {
  it('puts research under /research/ and everything else under /work/', () => {
    expect(entryPath({ id: 'crowdvis', category: 'research' })).toBe('/research/crowdvis/');
    expect(entryPath({ id: 'toren', category: 'game' })).toBe('/work/toren/');
  });
});

describe('platformGroups', () => {
  it('lists the main group first, then the others, once each', () => {
    expect(platformGroups({ platformGroup: 'playstation', alsoOn: ['pc', 'playstation'] })).toEqual(
      ['playstation', 'pc'],
    );
    expect(platformGroups({ platformGroup: 'vr' })).toEqual(['vr']);
    expect(platformGroups({ alsoOn: ['mobile'] })).toEqual(['mobile']);
    expect(platformGroups({})).toEqual([]);
  });
  it('counts a game on two platforms under both', () => {
    const both = make('both', { platformGroup: 'playstation', alsoOn: ['pc'] });
    const counts = platformCounts([both]);
    expect([counts.all, counts.playstation, counts.pc]).toEqual([1, 1, 1]);
  });
});

describe('platformCounts', () => {
  it('counts each group and the total', () => {
    expect(platformCounts(games(entries))).toEqual({
      all: 4,
      pc: 1,
      mobile: 1,
      playstation: 0,
      vr: 2,
      ar: 0,
    });
    expect(platformCounts([make('ungrouped')])).toEqual({
      all: 1,
      pc: 0,
      mobile: 0,
      playstation: 0,
      vr: 0,
      ar: 0,
    });
  });
});

describe('periodLabel', () => {
  it.each([
    [undefined, ''],
    [{}, ''],
    [{ start: '2019-08' }, '2019'],
    [{ start: '2019', end: '2019-12' }, '2019'],
    [{ start: '2019-08', end: '2021-03' }, '2019–2021'],
    [{ start: '2023', end: 'present' as const }, '2023–present'],
    [{ end: '2012' }, '2012'],
    [{ end: 'present' as const }, ''],
  ])('%j → %s', (period, label) => {
    expect(periodLabel(period)).toBe(label);
  });
});

describe('glyph', () => {
  it('uses the first word for featured cards and initials otherwise', () => {
    expect(glyph({ title: 'Until You Fall', tier: 'featured' })).toBe('UNTIL');
    expect(glyph({ title: 'Ben 10: Wrath of Psychobos', tier: 'selected' })).toBe('B1');
    expect(glyph({ title: 'N.E.R.O.T.', tier: 'archive' })).toBe('NE');
    expect(glyph({ title: '!!!', tier: 'featured' })).toBe('');
  });
});

describe('nextEntry', () => {
  const list = games(entries);
  it('returns the following entry and wraps around', () => {
    expect(nextEntry(list, 'a-game')?.id).toBe('b-game');
    expect(nextEntry(list, 'no-order')?.id).toBe('a-game');
  });

  it('returns nothing for an unknown id or a list of one', () => {
    expect(nextEntry(list, 'missing')).toBeUndefined();
    expect(nextEntry([make('solo')], 'solo')).toBeUndefined();
  });
});
