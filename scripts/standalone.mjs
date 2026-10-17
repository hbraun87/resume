// Packs the built home page (dist/index.html) into one self-contained HTML file
// that opens straight from disk (file://) and works as a static page anywhere,
// GitHub Pages included: fonts, images, styles and scripts are inlined, and
// project links point at the matching pages on henrybraun.info.
//
//   npm run build && npm run standalone   →   standalone/index.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const OUT = 'standalone/index.html';
const LIVE_SITE = 'https://henrybraun.info';

const { experiences } = JSON.parse(readFileSync('src/content/experiences.json', 'utf8'));
const legacy = new Map(experiences.map((entry) => [entry.id, entry.legacyPaths?.[0]]));

const asset = (path) => readFileSync(join(DIST, path.replace(/^\//, '')));
const dataUri = (path, type) => `data:${type};base64,${asset(path).toString('base64')}`;
const problems = [];

let html = readFileSync(join(DIST, 'index.html'), 'utf8');

// The CSP lists script hashes for the built files; inlined scripts would not match,
// and a file opened from disk has no origin for 'self' anyway.
html = html.replace(/<meta http-equiv="content-security-policy"[^>]*>/, '');
// Prefetching other site pages and the sitemap make no sense for a single file.
html = html.replace(/<script type="module" src="\/_astro\/page\.[^"]+"><\/script>/, '');
html = html.replace(/<link rel="sitemap"[^>]*>/, '');
html = html.replace(/<link rel="preload"[^>]*>/g, '');
html = html.replace(
  /<link rel="icon" href="([^"]+)"/,
  (_, href) => `<link rel="icon" href="${dataUri(href, 'image/svg+xml')}"`,
);

// Fonts.
html = html.replace(
  /url\("?(\/_astro\/fonts\/[^")]+\.woff2)"?\)/g,
  (_, path) => `url("${dataUri(path, 'font/woff2')}")`,
);

// Scripts: inline modules run from file:// where module files would be blocked.
html = html.replace(/<script type="module" src="(\/_astro\/[^"]+\.js)"><\/script>/g, (_, path) => {
  const code = asset(path).toString('utf8').replaceAll('</script', '<\\/script');
  return `<script type="module">${code}</script>`;
});

// Images: one WebP per picture (the largest, at most 800px wide, so cards stay sharp), inlined.
html = html.replace(/<picture[^>]*>([\s\S]*?)<\/picture>/g, (whole, inner) => {
  const webp =
    inner.match(/<source[^>]*srcset="([^"]+)"[^>]*type="image\/webp"/) ??
    inner.match(/<source type="image\/webp"[^>]*srcset="([^"]+)"/);
  const img = inner.match(/<img[^>]*>/)?.[0];
  if (!webp || !img) {
    problems.push(`picture without a WebP source: ${whole.slice(0, 120)}`);
    return whole;
  }
  const largest = webp[1].split(',').at(-1).trim().split(/\s+/)[0];
  return (
    img
      // The bytes are already in the file, so lazy loading only delays decoding.
      .replace(/\s(srcset|sizes|loading)="[^"]*"/g, '')
      .replace(/\ssrc="[^"]*"/, ` src="${dataUri(largest, 'image/webp')}"`)
  );
});

// Links: home sections become in-page anchors; project pages go to the live site.
html = html.replace(/href="\/#([\w-]+)"/g, 'href="#$1"');
html = html.replace(/href="\/"/g, 'href="#boot"');
html = html.replace(
  /<a href="\/(work|research)\/([\w-]+)\/"([^>]*)>([\s\S]*?)<\/a>/g,
  (_, _kind, id, attrs, text) => {
    const path = legacy.get(id);
    return path
      ? `<a href="${LIVE_SITE}${path}"${attrs}>${text}</a>`
      : `<span${attrs}>${text}</span>`;
  },
);

for (const leftover of html.match(/(?:src|href|srcset)="\/[^"#][^"]*"/g) ?? []) {
  problems.push(`still points at a site file: ${leftover}`);
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

mkdirSync('standalone', { recursive: true });
writeFileSync(OUT, html);
console.log(`Wrote ${OUT} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
