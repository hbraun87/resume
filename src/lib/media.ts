// Resolves the file names in experiences.json to Astro image imports, and picks
// posters. scripts/check-content.mjs has already proven every file exists.
import type { ImageMetadata } from 'astro';
import type { Experience, Media } from './schema.ts';

type ImageModules = Record<string, { default: ImageMetadata }>;

const projectImages: ImageModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/projects/*/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const profileImages: ImageModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/profile/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

/** The image `file` from src/assets/profile/. */
export function profileImage(file: string, images = profileImages): ImageMetadata {
  const image = images[`/src/assets/profile/${file}`];
  if (!image) throw new Error(`Missing image src/assets/profile/${file}`);
  return image.default;
}

/** The image `file` from src/assets/projects/<id>/. */
export function projectImage(id: string, file: string, images = projectImages): ImageMetadata {
  const image = images[`/src/assets/projects/${id}/${file}`];
  if (!image) throw new Error(`Missing image src/assets/projects/${id}/${file}`);
  return image.default;
}

/**
 * The poster file for a YouTube item: its own `poster`, else the entry's cover,
 * else its first image. Henry's captures beat YouTube's thumbnails, and using
 * them keeps the page free of requests to YouTube until the visitor clicks.
 */
export function posterFile(
  entry: Pick<Experience, 'cover' | 'media'>,
  item: Extract<Media, { type: 'youtube' }>,
): string | undefined {
  return (
    item.poster ?? entry.cover?.src ?? entry.media?.find((media) => media.type === 'image')?.src
  );
}
