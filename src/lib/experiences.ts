// Queries and labels over the experiences collection, shared by every page.
import type { Experience } from './schema.ts';

export type PlatformGroup = NonNullable<Experience['platformGroup']>;

export const PLATFORM_LABELS: Record<PlatformGroup, string> = {
  pc: 'PC',
  vr: 'VR',
  ar: 'AR',
  mobile: 'Mobile',
};

const GAME_CATEGORIES = new Set<Experience['category']>(['game', 'prototype', 'jam']);

const byOrder = (a: Experience, b: Experience) =>
  (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
  a.title.localeCompare(b.title);

/** Public entries in display order. Drafts never reach a page. */
export function publicEntries(entries: Experience[]): Experience[] {
  return entries.filter((entry) => entry.visibility === 'public').sort(byOrder);
}

export function isResearch(entry: Experience): boolean {
  return entry.category === 'research';
}

export function games(entries: Experience[]): Experience[] {
  return publicEntries(entries).filter((entry) => GAME_CATEGORIES.has(entry.category));
}

export function research(entries: Experience[]): Experience[] {
  return publicEntries(entries).filter(isResearch);
}

/** Route of an entry's page, before the base path. */
export function entryPath(entry: Pick<Experience, 'id' | 'category'>): string {
  return `/${entry.category === 'research' ? 'research' : 'work'}/${entry.id}/`;
}

export function platformCounts(entries: Experience[]): Record<PlatformGroup | 'all', number> {
  const counts = { all: entries.length, pc: 0, vr: 0, ar: 0, mobile: 0 };
  for (const entry of entries) if (entry.platformGroup) counts[entry.platformGroup] += 1;
  return counts;
}

/** "2019", "2019–2021", "2019–present", or "" when unknown. Months are dropped. */
export function periodLabel(period: Experience['period']): string {
  const start = period?.start?.slice(0, 4);
  const end = period?.end === 'present' ? 'present' : period?.end?.slice(0, 4);
  if (!start) return end && end !== 'present' ? end : '';
  if (!end || end === start) return start;
  return `${start}–${end}`;
}

/** The art-band glyph: the first word for featured cards, initials for the rest. */
export function glyph(entry: Pick<Experience, 'title' | 'tier'>): string {
  const words = entry.title
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (entry.tier === 'featured') return (words[0] ?? '').toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

/** The next entry of the same kind, wrapping around, to keep reviewers moving. */
export function nextEntry(list: Experience[], id: string): Experience | undefined {
  const index = list.findIndex((entry) => entry.id === id);
  if (index < 0 || list.length < 2) return undefined;
  return list[(index + 1) % list.length];
}
