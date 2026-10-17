import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Every built page as a path relative to the site base, e.g. "" or "work/toren/". */
export function builtPages(dist = 'dist'): string[] {
  const pages: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name === 'index.html') {
        const route = relative(dist, dir).split(sep).join('/');
        pages.push(route ? `${route}/` : '');
      }
    }
  };
  walk(dist);
  return pages.sort();
}

/** One page per template: other profiles test these, the core profiles test every page. */
export function samplePages(pages: string[]): Set<string> {
  const firstUnder = (prefix: string) =>
    pages.find((page) => page.startsWith(prefix) && page !== prefix);
  return new Set(
    ['', 'styleguide/', firstUnder('work/'), firstUnder('research/')].filter(
      (page): page is string => page !== undefined && pages.includes(page),
    ),
  );
}

/** Profiles that run every page: the narrowest phones, an iPhone, the iPad and desktop Chrome. */
export const EVERY_PAGE_PROFILES = [
  'Narrow 320',
  'Galaxy S24',
  'iPhone 17',
  'iPad Pro 11',
  'Desktop Chrome',
];

export function runsEveryPage(projectName: string): boolean {
  return EVERY_PAGE_PROFILES.some(
    (name) => projectName === name || projectName.startsWith(`${name} (`),
  );
}
