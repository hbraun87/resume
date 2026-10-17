import { describe, expect, it } from 'vitest';
import { posterFile, projectImage } from '../../src/lib/media';

const meta = { src: '/x.jpg', width: 1600, height: 900, format: 'jpg' } as const;
const images = { '/src/assets/projects/toren/01.jpg': { default: meta } };
const video = { type: 'youtube', id: 'JjSu--jB4Zs', title: 'Toren video' } as const;

describe('projectImage', () => {
  it('finds an image by entry id and file name', () => {
    expect(projectImage('toren', '01.jpg', images)).toBe(meta);
  });

  it('names the missing file', () => {
    expect(() => projectImage('toren', '09.jpg', images)).toThrow(
      'Missing image src/assets/projects/toren/09.jpg',
    );
  });

  it('resolves real project images by default', () => {
    expect(projectImage('toren', '01.jpg')).toBeTruthy();
  });
});

describe('posterFile', () => {
  const image = { type: 'image', src: '02.jpg', alt: 'A frame' } as const;

  it('prefers the explicit poster, then the cover, then the first image', () => {
    const cover = { src: 'cover.jpg', alt: 'Cover' };
    expect(posterFile({ cover, media: [image] }, { ...video, poster: 'p.jpg' })).toBe('p.jpg');
    expect(posterFile({ cover, media: [image] }, video)).toBe('cover.jpg');
    expect(posterFile({ media: [video, image] }, video)).toBe('02.jpg');
  });

  it('returns nothing when the entry has no images', () => {
    expect(posterFile({ media: [video] }, video)).toBeUndefined();
    expect(posterFile({}, video)).toBeUndefined();
  });
});
