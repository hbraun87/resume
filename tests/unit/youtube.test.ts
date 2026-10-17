// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { embedUrl, enhanceYouTube, play, watchUrl } from '../../src/lib/youtube';
import { must } from '../must';

const facade = (attrs = 'data-youtube-start="12"') => `
  <div class="yt" data-youtube-id="S1zZHy7_BFg" data-youtube-title="Until You Fall trailer" ${attrs}>
    <a class="yt-target" data-astro-cid-x href="${watchUrl('S1zZHy7_BFg')}"><img alt="" src="poster.jpg" /><span>Play</span></a>
  </div>`;

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('URLs', () => {
  it('builds watch links with and without a start time', () => {
    expect(watchUrl('S1zZHy7_BFg')).toBe('https://www.youtube.com/watch?v=S1zZHy7_BFg');
    expect(watchUrl('S1zZHy7_BFg', 30)).toBe('https://www.youtube.com/watch?v=S1zZHy7_BFg&t=30s');
  });

  it('embeds through youtube-nocookie and autoplays after the click', () => {
    const url = new URL(embedUrl('S1zZHy7_BFg', 12));
    expect(url.origin).toBe('https://www.youtube-nocookie.com');
    expect(url.pathname).toBe('/embed/S1zZHy7_BFg');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      autoplay: '1',
      rel: '0',
      playsinline: '1',
      start: '12',
    });
    expect(new URL(embedUrl('S1zZHy7_BFg')).searchParams.has('start')).toBe(false);
  });
});

describe('enhanceYouTube', () => {
  it('turns the link into a named button and keeps the poster', () => {
    document.body.innerHTML = facade();
    expect(enhanceYouTube()).toBe(1);
    const button = document.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Play video: Until You Fall trailer');
    expect(button?.className).toBe('yt-target');
    expect(button?.hasAttribute('data-astro-cid-x')).toBe(true);
    expect(button?.hasAttribute('href')).toBe(false);
    expect(button?.querySelector('img')).not.toBeNull();
    expect(document.querySelector('a')).toBeNull();
  });

  it('loads the player on click, focused, with a title', () => {
    document.body.innerHTML = facade();
    enhanceYouTube(document.body);
    document.querySelector('button')?.click();
    const iframe = document.querySelector('iframe');
    expect(iframe?.src).toBe(embedUrl('S1zZHy7_BFg', 12));
    expect(iframe?.title).toBe('Until You Fall trailer');
    expect(iframe?.allowFullscreen).toBe(true);
    expect(document.activeElement).toBe(iframe);
    expect(document.querySelector<HTMLElement>('.yt')?.dataset['youtubeState']).toBe('playing');
  });

  it('is idempotent and skips facades without a link', () => {
    document.body.innerHTML = facade() + '<div data-youtube-id="x"></div>';
    expect(enhanceYouTube()).toBe(1);
    expect(enhanceYouTube()).toBe(0);
  });

  it('copes with missing optional data', () => {
    document.body.innerHTML = `<div data-youtube-id="S1zZHy7_BFg"><a href="#">Play</a></div>`;
    enhanceYouTube();
    expect(document.querySelector('button')?.getAttribute('aria-label')).toBe('Play video: ');
    const iframe = play(
      must(document.querySelector<HTMLElement>('[data-youtube-id]'), '[data-youtube-id]'),
    );
    expect(iframe.src).toBe(embedUrl('S1zZHy7_BFg'));
  });

  it('starts from an empty id rather than crashing on a malformed facade', () => {
    document.body.innerHTML = `<div data-youtube-id></div>`;
    const el = must(document.querySelector<HTMLElement>('div'), 'div');
    delete el.dataset['youtubeId'];
    expect(play(el).src).toBe(embedUrl(''));
  });
});
