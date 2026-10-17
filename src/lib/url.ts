/**
 * Builds an internal URL that respects the configured base path, so links work
 * both at https://hbraun87.github.io/resume/ and at a custom domain root.
 * Every internal link in the site goes through this helper.
 */
export function url(path = '/', base: string = import.meta.env.BASE_URL): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) {
    throw new Error(`url() is for internal paths only, got "${path}"`);
  }
  const [pathname = '', suffix = ''] = splitSuffix(path);
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const joined = `${prefix}${pathname.replace(/^\/+/, '')}`;
  // Directory-style routes get a trailing slash; files (with an extension) do not.
  const needsSlash = !joined.endsWith('/') && !/\.[a-z\d]+$/i.test(joined);
  return `${needsSlash ? `${joined}/` : joined}${suffix}`;
}

function splitSuffix(path: string): [string, string] {
  const index = path.search(/[?#]/);
  return index === -1 ? [path, ''] : [path.slice(0, index), path.slice(index)];
}
