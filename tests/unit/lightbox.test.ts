// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  createLightbox,
  enhanceGalleries,
  readSlides,
  step,
  swipeDirection,
} from '../../src/lib/lightbox';
import { must } from '../must';

const gallery = (count = 3, label = 'Toren gallery') => `
  <ul data-gallery="${label}">
    ${Array.from(
      { length: count },
      (
        _,
        i,
      ) => `<li><a data-lightbox href="/full/${i}.webp" ${i === 0 ? '' : `data-caption="Caption ${i}"`}>
        <img alt="Frame ${i}" src="/thumb/${i}.webp" /></a></li>`,
    ).join('')}
  </ul>`;

const dialog = () => must(document.querySelector('dialog'), 'dialog');
const shown = () => must(dialog().querySelector('img'), 'img');
const click = (el: Element, init: MouseEventInit = {}) =>
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('step', () => {
  it('wraps in both directions', () => {
    expect(step(0, -1, 3)).toBe(2);
    expect(step(2, 1, 3)).toBe(0);
    expect(step(1, 1, 3)).toBe(2);
  });
});

describe('swipeDirection', () => {
  it('reads clear horizontal swipes only', () => {
    expect(swipeDirection(-80, 5)).toBe(-1);
    expect(swipeDirection(80, -5)).toBe(1);
    expect(swipeDirection(20, 0)).toBe(0);
    expect(swipeDirection(60, 50)).toBe(0);
  });
});

describe('readSlides', () => {
  it('takes the full image, alt text and caption from each link', () => {
    document.body.innerHTML = gallery(2) + '<a id="bare" href="/x.webp"></a>';
    const links = [...document.querySelectorAll<HTMLAnchorElement>('a')];
    expect(readSlides(links).map(({ alt, caption }) => [alt, caption])).toEqual([
      ['Frame 0', ''],
      ['Frame 1', 'Caption 1'],
      ['', ''],
    ]);
  });
});

describe('enhanceGalleries', () => {
  it('opens the clicked image in a labelled modal dialog', () => {
    document.body.innerHTML = gallery();
    expect(enhanceGalleries()).toBe(1);
    const link = must(document.querySelectorAll('a')[1], 'link 1');
    expect(click(link)).toBe(false);
    expect(dialog().open).toBe(true);
    expect(dialog().getAttribute('aria-label')).toBe('Toren gallery');
    expect(shown().alt).toBe('Frame 1');
    expect(shown().src).toMatch(/\/full\/1\.webp$/);
    expect(dialog().querySelector('figcaption')?.textContent).toBe('Caption 1');
    expect(dialog().querySelector('.lightbox-count')?.textContent).toBe('2 / 3');
    expect(document.activeElement?.className).toBe('lightbox-close');
  });

  it('hides an empty caption', () => {
    document.body.innerHTML = gallery();
    enhanceGalleries();
    click(must(document.querySelector('a'), 'a'));
    expect(dialog().querySelector('figcaption')?.hidden).toBe(true);
  });

  it('moves with the buttons and arrow keys, wrapping around', () => {
    document.body.innerHTML = gallery();
    enhanceGalleries();
    click(must(document.querySelector('a'), 'a'));
    click(must(dialog().querySelector('.lightbox-prev'), '.lightbox-prev'));
    expect(shown().alt).toBe('Frame 2');
    click(must(dialog().querySelector('.lightbox-next'), '.lightbox-next'));
    expect(shown().alt).toBe('Frame 0');
    dialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(shown().alt).toBe('Frame 1');
    dialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(shown().alt).toBe('Frame 0');
    dialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(shown().alt).toBe('Frame 0');
  });

  it('follows swipes and ignores taps', () => {
    document.body.innerHTML = gallery();
    enhanceGalleries();
    click(must(document.querySelector('a'), 'a'));
    const swipe = (from: number, to: number) => {
      dialog().dispatchEvent(new PointerEvent('pointerdown', { clientX: from, clientY: 100 }));
      dialog().dispatchEvent(new PointerEvent('pointerup', { clientX: to, clientY: 100 }));
    };
    swipe(300, 100);
    expect(shown().alt).toBe('Frame 1');
    swipe(100, 300);
    expect(shown().alt).toBe('Frame 0');
    swipe(100, 110);
    expect(shown().alt).toBe('Frame 0');
    dialog().dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 0 }));
    expect(shown().alt).toBe('Frame 0');
  });

  it('closes from the button or the backdrop and returns focus to the thumbnail', () => {
    document.body.innerHTML = gallery();
    enhanceGalleries();
    const link = must(document.querySelectorAll('a')[2], 'link 2');
    click(link);
    click(must(dialog().querySelector('figure'), 'figure'));
    expect(dialog().open).toBe(true);
    click(dialog());
    expect(dialog().open).toBe(false);
    expect(document.activeElement).toBe(link);
    click(link);
    click(must(dialog().querySelector('.lightbox-close'), '.lightbox-close'));
    expect(dialog().open).toBe(false);
  });

  it('shares one dialog, hides arrows for a single image and is idempotent', () => {
    document.body.innerHTML = gallery(1, '') + gallery(2);
    expect(enhanceGalleries()).toBe(2);
    expect(enhanceGalleries()).toBe(0);
    const [single, , second] = document.querySelectorAll('a');
    click(must(single, 'single link'));
    expect(dialog().getAttribute('aria-label')).toBe('Image viewer');
    expect(dialog().querySelector<HTMLElement>('.lightbox-next')?.hidden).toBe(true);
    dialog().close();
    click(must(second, 'second link'));
    expect(document.querySelectorAll('dialog')).toHaveLength(1);
    expect(dialog().querySelector<HTMLElement>('.lightbox-next')?.hidden).toBe(false);
  });

  it('leaves modified clicks to the browser (new tab, download)', () => {
    document.body.innerHTML = gallery();
    enhanceGalleries();
    expect(click(must(document.querySelector('a'), 'a'), { ctrlKey: true })).toBe(true);
    expect(click(must(document.querySelector('a'), 'a'), { metaKey: true })).toBe(true);
    expect(click(must(document.querySelector('a'), 'a'), { shiftKey: true })).toBe(true);
    expect(click(must(document.querySelector('a'), 'a'), { altKey: true })).toBe(true);
    expect(document.querySelector('dialog')).toBeNull();
  });
});

describe('createLightbox', () => {
  it('does nothing when asked to render an empty set', () => {
    const lightbox = createLightbox('Empty');
    lightbox.open([], 0);
    expect(lightbox.index).toBe(0);
    expect(shown().getAttribute('src')).toBeNull();
    lightbox.dialog.close();
  });
});
