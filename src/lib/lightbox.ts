// Gallery lightbox. Each thumbnail is a plain link to the full image, so
// without JavaScript it still opens. enhanceGalleries() opens those links in a
// native <dialog> instead: arrow keys and swipes move between images, Escape
// or the close button returns focus to the thumbnail.

export interface Slide {
  src: string;
  alt: string;
  caption: string;
}

/** Wraps around both ends. */
export function step(index: number, delta: number, length: number): number {
  return (((index + delta) % length) + length) % length;
}

/** -1 for a left swipe (next), 1 for a right swipe (previous), 0 when not a clear horizontal swipe. */
export function swipeDirection(dx: number, dy: number, threshold = 40): -1 | 0 | 1 {
  if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return 0;
  return dx < 0 ? -1 : 1;
}

export function readSlides(links: HTMLAnchorElement[]): Slide[] {
  return links.map((link) => ({
    src: link.href,
    alt: link.querySelector('img')?.alt ?? '',
    caption: link.dataset['caption'] ?? '',
  }));
}

const ICONS = {
  prev: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  close: 'M6 6l12 12M18 6L6 18',
};

function iconButton(name: keyof typeof ICONS, label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `lightbox-${name}`;
  button.setAttribute('aria-label', label);
  button.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="${ICONS[name]}" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
  return button;
}

export interface Lightbox {
  dialog: HTMLDialogElement;
  open(slides: Slide[], index: number, opener?: HTMLElement): void;
  go(delta: number): void;
  readonly index: number;
}

/** Builds the one dialog every gallery on the page shares. */
export function createLightbox(label: string): Lightbox {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', label);
  const figure = document.createElement('figure');
  const image = document.createElement('img');
  image.decoding = 'async';
  const caption = document.createElement('figcaption');
  const counter = document.createElement('p');
  counter.className = 'lightbox-count mono';
  counter.setAttribute('aria-live', 'polite');
  const prev = iconButton('prev', 'Previous image');
  const next = iconButton('next', 'Next image');
  const close = iconButton('close', 'Close');
  figure.append(image, caption);
  dialog.append(figure, counter, prev, next, close);
  document.body.append(dialog);

  let slides: Slide[] = [];
  let index = 0;
  let opener: HTMLElement | undefined;

  const render = () => {
    const slide = slides[index];
    if (!slide) return;
    image.src = slide.src;
    image.alt = slide.alt;
    caption.textContent = slide.caption;
    caption.hidden = !slide.caption;
    counter.textContent = `${index + 1} / ${slides.length}`;
    prev.hidden = next.hidden = slides.length < 2;
  };
  const go = (delta: number) => {
    index = step(index, delta, slides.length);
    render();
  };

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') go(-1);
    else if (event.key === 'ArrowRight') go(1);
  });
  // A click on the backdrop (the dialog itself, outside the figure) closes it.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  let start: { x: number; y: number } | undefined;
  dialog.addEventListener('pointerdown', (event) => {
    start = { x: event.clientX, y: event.clientY };
  });
  dialog.addEventListener('pointerup', (event) => {
    if (!start) return;
    const direction = swipeDirection(event.clientX - start.x, event.clientY - start.y);
    start = undefined;
    if (direction) go(-direction);
  });
  dialog.addEventListener('close', () => opener?.focus());

  return {
    dialog,
    open(nextSlides, nextIndex, nextOpener) {
      slides = nextSlides;
      index = nextIndex;
      opener = nextOpener;
      render();
      dialog.showModal();
      close.focus();
    },
    go,
    get index() {
      return index;
    },
  };
}

/** Opens every `[data-gallery]` link in the shared lightbox. Returns the galleries enhanced. */
export function enhanceGalleries(root: ParentNode = document): number {
  let lightbox: Lightbox | undefined;
  let count = 0;
  for (const gallery of root.querySelectorAll<HTMLElement>('[data-gallery]')) {
    if (gallery.dataset['galleryReady']) continue;
    gallery.dataset['galleryReady'] = 'true';
    count += 1;
    const links = [...gallery.querySelectorAll<HTMLAnchorElement>('a[data-lightbox]')];
    const slides = readSlides(links);
    links.forEach((link, index) => {
      link.addEventListener('click', (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        lightbox ??= createLightbox(gallery.dataset['gallery'] || 'Image viewer');
        lightbox.open(slides, index, link);
      });
    });
  }
  return count;
}
