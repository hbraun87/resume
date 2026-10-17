// Click-to-load YouTube (docs/brief/06-media-pipeline.md). The server renders a
// link to youtube.com with a self-hosted poster; enhanceYouTube() turns it into
// a play button that swaps in the privacy-enhanced player only when clicked.

export function watchUrl(id: string, start?: number): string {
  return `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}`;
}

export function embedUrl(id: string, start?: number): string {
  const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1' });
  if (start) params.set('start', String(start));
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

const ALLOW = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';

/** Replaces the facade's link with the player and moves focus into it. */
export function play(facade: HTMLElement): HTMLIFrameElement {
  const { youtubeId = '', youtubeTitle = '', youtubeStart } = facade.dataset;
  const iframe = document.createElement('iframe');
  iframe.src = embedUrl(youtubeId, youtubeStart ? Number(youtubeStart) : undefined);
  iframe.title = youtubeTitle;
  iframe.allow = ALLOW;
  iframe.allowFullscreen = true;
  facade.replaceChildren(iframe);
  facade.dataset['youtubeState'] = 'playing';
  iframe.focus();
  return iframe;
}

/**
 * Upgrades every facade under root: the link becomes a button named
 * "Play video: <title>". Without JavaScript the link still opens YouTube.
 */
export function enhanceYouTube(root: ParentNode = document): number {
  let count = 0;
  for (const facade of root.querySelectorAll<HTMLElement>('[data-youtube-id]')) {
    const link = facade.querySelector('a');
    if (!link || facade.dataset['youtubeState']) continue;
    const button = document.createElement('button');
    // Keep the link's class and Astro's scoped-style attribute so the button looks the same.
    for (const { name, value } of link.attributes) {
      if (name !== 'href') button.setAttribute(name, value);
    }
    button.type = 'button';
    button.setAttribute('aria-label', `Play video: ${facade.dataset['youtubeTitle'] ?? ''}`);
    button.append(...link.childNodes);
    button.addEventListener('click', () => play(facade), { once: true });
    link.replaceWith(button);
    facade.dataset['youtubeState'] = 'ready';
    count += 1;
  }
  return count;
}
