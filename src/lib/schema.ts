/**
 * The content contract (docs/brief/05-content-model.md). These Zod schemas are
 * the single source of truth: Astro validates the JSON with them at build time,
 * and scripts/gen-schema.mjs turns them into experience.schema.json for editors.
 */
import { z } from 'zod';

const yearMonth = z
  .string()
  .regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Use YYYY or YYYY-MM, for example "2019" or "2019-08"');

const altText = z.string().trim().min(1, 'Alt text is required; describe what the image shows');

/** Accepts an 11-character YouTube id or any common YouTube URL and returns the id. */
export const youtubeId = z.string().transform((value, ctx) => {
  const id = parseYouTubeId(value);
  if (!id) {
    ctx.addIssue({ code: 'custom', message: `"${value}" is not a YouTube video id or URL` });
    return z.NEVER;
  }
  return id;
});

export function parseYouTubeId(value: string): string | null {
  const trimmed = value.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

const imageFile = z
  .string()
  .regex(/^[\w.-]+\.(jpe?g|png|webp|avif)$/i, 'Images must be .jpg, .jpeg, .png, .webp or .avif');

export const mediaSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('youtube'),
    id: youtubeId,
    title: z.string().min(1, 'YouTube items need a title (the play button’s accessible name)'),
    start: z.number().int().nonnegative().optional(),
    poster: imageFile.optional(),
  }),
  z.object({
    type: z.literal('image'),
    src: imageFile,
    alt: altText,
    caption: z.string().optional(),
    credit: z.string().optional(),
  }),
  z.object({
    type: z.literal('gif'),
    src: z.string().regex(/^[\w.-]+\.gif$/i, 'GIF items must point to a .gif file'),
    alt: altText,
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal('video'),
    src: z.string().regex(/^[\w.-]+\.(mp4|webm)$/i, 'Videos must be .mp4 or .webm'),
    alt: altText,
    caption: z.string().optional(),
    loop: z.boolean().optional(),
  }),
]);

export const linkKinds = [
  'steam',
  'meta',
  'app-store',
  'google-play',
  'website',
  'press',
  'paper',
  'doi',
  'video',
  'repo',
  'talk',
  'other',
] as const;

const linkSchema = z.object({
  kind: z.enum(linkKinds),
  label: z.string().min(1),
  url: z.url({ protocol: /^https?$/ }),
});

const platformGroup = z.enum(['pc', 'mobile', 'playstation', 'vr', 'ar']);

export const experienceSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use kebab-case: lowercase letters, digits and dashes'),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    category: z.enum(['game', 'prototype', 'tool', 'research', 'jam', 'other']),
    tier: z.enum(['featured', 'selected', 'archive']),
    status: z.enum([
      'shipped',
      'released-early-access',
      'in-development',
      'prototype',
      'unreleased',
      'published',
    ]),
    // public: on the site. hidden: finished and checked like public, but kept off the
    // site until Henry flips it back. draft: unreleased or NDA work, checked loosely.
    visibility: z.enum(['public', 'hidden', 'draft']),
    order: z.number().int().optional(),
    studio: z.string().optional(),
    client: z.string().optional(),
    role: z.string().min(1),
    responsibilities: z.array(z.string()).optional(),
    period: z
      .object({
        start: yearMonth.optional(),
        end: z.union([yearMonth, z.literal('present')]).optional(),
      })
      .optional(),
    platforms: z.array(z.string()).optional(),
    /** The home page filter group (docs/brief/10-loading-screen-spec.md). */
    platformGroup: platformGroup.optional(),
    /** More groups the game is also on, each shown as its own chip and filter match. */
    alsoOn: z.array(platformGroup).optional(),
    engine: z.string().optional(),
    tech: z.array(z.string()).optional(),
    teamSize: z.number().int().positive().optional(),
    tags: z.array(z.string()).optional(),
    summary: z.string().min(1).max(200, 'Keep the summary under 200 characters'),
    highlights: z.array(z.string().min(1)).optional(),
    metrics: z
      .array(z.object({ label: z.string(), value: z.string(), note: z.string().optional() }))
      .optional(),
    awards: z
      .array(
        z.object({ name: z.string(), year: z.number().int().optional(), url: z.url().optional() }),
      )
      .optional(),
    caseStudy: z
      .object({
        challenge: z.string().min(1),
        contributions: z
          .array(
            z.object({
              heading: z.string().min(1),
              body: z.string().min(1),
              media: z.array(z.string()).optional(),
            }),
          )
          .min(1),
        deepDive: z.string().optional(),
        outcome: z.string().min(1),
      })
      .optional(),
    /** Optional: cards without a cover use the generated title-glyph art band. */
    cover: z.object({ src: imageFile, alt: altText }).optional(),
    coverLoop: z.object({ src: z.string().regex(/^[\w.-]+\.(gif|mp4|webm)$/i) }).optional(),
    media: z.array(mediaSchema).optional(),
    links: z.array(linkSchema).optional(),
    publication: z
      .object({
        venue: z.string().optional(),
        year: z.number().int().optional(),
        authors: z.array(z.string()).optional(),
        abstract: z.string().optional(),
        peerReviewed: z.boolean().optional(),
      })
      .optional(),
    legacyPaths: z.array(z.string().regex(/^\//, 'Legacy paths start with "/"')).optional(),
  })
  .superRefine((entry, ctx) => {
    if (entry.tier === 'featured' && entry.visibility !== 'draft' && !entry.caseStudy) {
      ctx.addIssue({
        code: 'custom',
        path: ['caseStudy'],
        message: 'Featured entries need a caseStudy',
      });
    }
    if (entry.tier !== 'archive' && entry.category !== 'research' && !entry.highlights?.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['highlights'],
        message: 'Featured and selected entries need 2–4 highlights',
      });
    }
    if (
      entry.visibility !== 'draft' &&
      ['game', 'prototype', 'jam'].includes(entry.category) &&
      !entry.platformGroup
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['platformGroup'],
        message: 'Public games need a platformGroup: pc, mobile, playstation, vr or ar',
      });
    }
    if (entry.category === 'research' && !entry.publication) {
      ctx.addIssue({
        code: 'custom',
        path: ['publication'],
        message: 'Research entries need a publication object',
      });
    }
    const { start, end } = entry.period ?? {};
    if (start && end && end !== 'present' && end < start) {
      ctx.addIssue({
        code: 'custom',
        path: ['period', 'end'],
        message: 'period.end is before period.start',
      });
    }
  });

export const experiencesFileSchema = z.object({
  $schema: z.string().optional(),
  experiences: z.array(experienceSchema),
});

const roleSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  start: yearMonth,
  end: z.union([yearMonth, z.literal('present')]).optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  pitch: z.string().min(1),
  location: z.string().min(1),
  availability: z.string().optional(),
  email: z.email(),
  /** Profile links; "hidden" keeps one in the file but off the site. */
  links: z.array(
    z.object({
      kind: z.string(),
      label: z.string(),
      url: z.url(),
      visibility: z.enum(['public', 'hidden']).optional(),
    }),
  ),
  /** The footer's "Built with Astro · Source on GitHub · Build" line. */
  footer: z.object({ buildLine: z.enum(['public', 'hidden']) }),
  portrait: z.object({ src: imageFile, alt: altText }).optional(),
  bio: z.string().min(1),
  pillars: z.array(z.object({ title: z.string(), body: z.string(), proof: z.string() })),
  credits: z.array(z.string()),
  /** Copy for the loading-screen home page (docs/brief/10-loading-screen-spec.md). */
  home: z.object({
    class: z.string().min(1),
    /** The hero's career line; {titles} becomes the number of public games. */
    statement: z.string().min(1),
    tagline: z.string().min(1),
    profileHeadline: z.string().min(1),
    /** Stats the data cannot compute; the page adds title and research counts. */
    stats: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).length(2),
    skillTree: z.array(z.string().min(1)).min(1),
    gamesLede: z.string().min(1),
    researchLede: z.string().min(1),
    finaleHeadline: z.string().min(1),
    contactHeadline: z.string().min(1),
    /** Optional line under the contact headline. */
    contactLede: z.string().min(1).optional(),
  }),
  /** Rotating loading-screen tips on the home page HUD. */
  tips: z.array(z.string().min(1)).min(1),
  roles: z.array(roleSchema).min(1),
  skills: z.object({
    engines: z.array(z.string()),
    languages: z.array(z.string()),
    platforms: z.array(z.string()),
    practices: z.array(z.string()),
  }),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      start: yearMonth.optional(),
      end: yearMonth.optional(),
      notes: z.string().optional(),
    }),
  ),
  languages: z.array(z.string()),
  resume: z.object({
    pdfFileName: z.string().regex(/^[\w-]+\.pdf$/),
    includeTiers: z.array(z.enum(['featured', 'selected', 'archive'])),
  }),
  /** Working notes for agents; check-content fails the build if they are published. */
  _notes: z.string().optional(),
});

export type Experience = z.output<typeof experienceSchema>;
export type Media = z.output<typeof mediaSchema>;
export type Profile = z.output<typeof profileSchema>;
