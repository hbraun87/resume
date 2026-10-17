import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { experienceSchema, profileSchema } from './lib/schema';

const experiences = defineCollection({
  loader: file('src/content/experiences.json', {
    // The file keeps a top-level "$schema" key for editor support.
    parser: (text) => JSON.parse(text).experiences,
  }),
  schema: experienceSchema,
});

const profile = defineCollection({
  loader: file('src/content/profile.json', {
    parser: (text) => [{ id: 'henry', ...JSON.parse(text) }],
  }),
  schema: profileSchema,
});

export const collections = { experiences, profile };
