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
