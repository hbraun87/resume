// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL and BASE_PATH come from repository variables in CI, so the same
// build works at https://hbraun87.github.io/resume/ and at a custom domain root.
const SITE = process.env.SITE_URL || 'https://henrybraun.dev';
const BASE = process.env.BASE_PATH || '/';

const FONTS = './node_modules/@fontsource';

const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

/**
 * @param {string} name
 * @param {`--${string}`} cssVariable
 * @param {string} file path to a Latin-subset WOFF2 file
 * @param {string} weight
 * @param {string[]} fallbacks
 */
function localFont(name, cssVariable, file, weight, fallbacks) {
  return {
    provider: fontProviders.local(),
    name,
    cssVariable,
    fallbacks,
    display: /** @type {const} */ ('swap'),
    options: {
      // Cast: the local provider expects non-empty tuples, which JS literals infer as arrays.
      variants:
        /** @type {[{ src: [string]; weight: string; style: 'normal'; unicodeRange: [string] }]} */ ([
          { src: [file], weight, style: 'normal', unicodeRange: [LATIN] },
        ]),
    },
  };
}

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/styleguide/') })],
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' https://i.ytimg.com data:",
        'frame-src https://www.youtube-nocookie.com',
        "font-src 'self'",
        "base-uri 'self'",
        "form-action 'none'",
      ],
    },
  },
  // Fonts are self-hosted from Fontsource packages (Latin subset, which covers
  // Portuguese diacritics), so a page view makes no third-party requests.
  // The display face is the static 900 cut: the variable file has overlapping
  // contours that show through outlined (text-stroke) lettering.
  fonts: [
    localFont(
      'Unbounded',
      '--font-display',
      `${FONTS}/unbounded/files/unbounded-latin-900-normal.woff2`,
      '900',
      ['Arial Black', 'sans-serif'],
    ),
    localFont(
      'Instrument Sans',
      '--font-body',
      `${FONTS}-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2`,
      '400 700',
      ['Helvetica', 'Arial', 'sans-serif'],
    ),
    localFont(
      'JetBrains Mono',
      '--font-mono',
      `${FONTS}-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2`,
      '400 600',
      ['Menlo', 'monospace'],
    ),
  ],
});
