// Views over profile.json for the home page's character sheet and quest log.
import type { Profile } from './schema';

type Role = Profile['roles'][number];

export interface Quest {
  title: string;
  company: string;
  years: string;
}

/** "2015–2021", "2013", or "2021–present" from YYYY or YYYY-MM dates. */
export function yearSpan(start: string, end?: string): string {
  const from = start.slice(0, 4);
  const to = end === 'present' ? 'present' : end?.slice(0, 4);
  return !to || to === from ? from : `${from}–${to}`;
}

/**
 * Active quests are current roles; completed quests are earlier employers,
 * one line each with the latest title and the whole span there.
 * Roles are listed newest first in profile.json.
 */
export function questLog(roles: Role[]): { active: Quest[]; completed: Quest[] } {
  const active = roles
    .filter((role) => role.end === 'present')
    .map((role) => ({
      title: role.title,
      company: role.company,
      years: yearSpan(role.start, role.end),
    }));
  const activeCompanies = new Set(active.map((quest) => quest.company));
  const byCompany = new Map<string, Quest & { start: string; end: string }>();
  for (const role of roles) {
    if (activeCompanies.has(role.company)) continue;
    const end = role.end ?? role.start;
    const seen = byCompany.get(role.company);
    if (!seen) {
      byCompany.set(role.company, {
        title: role.title,
        company: role.company,
        years: '',
        start: role.start,
        end,
      });
      continue;
    }
    if (role.start < seen.start) seen.start = role.start;
    if (end > seen.end) seen.end = end;
  }
  const completed = [...byCompany.values()].map(({ title, company, start, end }) => ({
    title,
    company,
    years: yearSpan(start, end),
  }));
  return { active, completed };
}

/** Companies of the current roles, in order, without repeats. */
export function guilds(roles: Role[]): string[] {
  return [...new Set(roles.filter((role) => role.end === 'present').map((role) => role.company))];
}

/** The bio split into paragraphs. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}
