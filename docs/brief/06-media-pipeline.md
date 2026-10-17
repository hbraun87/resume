# 06 — Media pipeline: YouTube, images, GIFs

Game work is judged by footage. Media must look superb *and* cost nothing until it is needed.

## YouTube — click-to-load facade

A standard YouTube iframe pulls well over a megabyte of scripts and connects to several third-party domains before the visitor does anything. Instead:

- Render a **facade**: a `<lite-youtube>`-style web component (port of Paul Irish's `lite-youtube-embed`, or the maintained npm package) showing the poster image and a play button. On click (or Enter/Space), it swaps in the real iframe from `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0&start=<start>` and focuses it.
- **Poster**: by default, download `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` (fall back to `hqdefault.jpg` if maxres 404s) **at build time** into the image pipeline, so the poster is self-hosted, served as AVIF/WebP, and sized responsively. An explicit `poster` in JSON overrides it. This keeps initial page load free of third-party requests.
- **Accessible**: the facade is a real `<button>` with `aria-label="Play video: <title>"`; the iframe gets `title="<title>"` and `allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"` and `allowfullscreen`.
- **Layout**: fixed `aspect-ratio: 16 / 9` box (9/16 if `"vertical": true` for Shorts) — zero CLS.
- **No-JS fallback**: the facade wraps a normal link to `https://www.youtube.com/watch?v=<id>`, so it still works without JavaScript.
- **Structured data**: each video adds a `VideoObject` (name, thumbnailUrl, embedUrl, uploadDate if provided) to the page's JSON-LD.
- Optionally support Vimeo via the same component with `type: "vimeo"` later; the schema leaves room.

## Images — Astro's image pipeline

- Source files live in `src/assets/projects/<id>/`. Commit originals at full quality (PNG/JPG, ≥ 1600px for covers).
- Render with Astro's `<Picture>`: formats `['avif', 'webp']` with the original as fallback; widths `[480, 800, 1200, 1600, 2400]`; `sizes` set per layout slot (card vs full-bleed). `loading="lazy"` and `decoding="async"` everywhere **except** the LCP image (hero/first cover): `loading="eager"` + `fetchpriority="high"`.
- Width/height always emitted → no layout shift.
- Low-quality placeholder: a tiny blurred version (or dominant color) as CSS background while the full image loads, computed at build.
- Gallery thumbnails use the same pipeline at small widths; the lightbox loads the 1600/2400 variant on open.
- Captions in `<figcaption>`; credit line in small mono text when `credit` is set.

## GIFs — converted to video automatically

Animated GIFs are often 5–20× larger than an equivalent video, and Lighthouse flags them ("Use video formats for animated content"). Henry can still drop GIFs into the folder; the build converts them.

`scripts/media.mjs` (runs before `astro build`):

1. Finds every `type: "gif"` media item and every `coverLoop` in `experiences.json`.
2. For each source, computes a content hash; if `.cache/media/<hash>/` exists, reuses it.
3. Otherwise, using `ffmpeg-static` (pinned binary, no system dependency):
   ```bash
   # MP4 / H.264 — universal
   ffmpeg -i in.gif -movflags +faststart -pix_fmt yuv420p \
          -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 23 -preset slow out.mp4
   # WebM / VP9 — smaller where supported
   ffmpeg -i in.gif -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 out.webm
   # Poster — first frame
   ffmpeg -i in.gif -vframes 1 poster.png
   ```
   Also caps width at 1600px and frame rate at 30 fps.
4. Writes outputs to `public/media/<id>/<name>.{webm,mp4}` and the poster into the image pipeline; records dimensions in a manifest for the component.

Rendered by `LoopVideo`:

```html
<video autoplay loop muted playsinline preload="none"
       width="1280" height="720" poster="/media/until-you-fall/parry.poster.avif"
       aria-label="Slow-motion parry window visualization">
  <source src="/media/until-you-fall/parry.webm" type="video/webm">
  <source src="/media/until-you-fall/parry.mp4"  type="video/mp4">
</video>
```

Behavior (small TS controller, shared with hover loops):
- Plays only when ≥ 50% visible (IntersectionObserver); pauses when off-screen or the tab is hidden.
- Under `prefers-reduced-motion: reduce`: never autoplays; shows the poster with a small play/pause control.
- Always shows an accessible pause control (WCAG 2.2.2 — moving content longer than 5 s must be pausable).
- Card hover loops: `preload="none"`, start on `pointerenter`/`focus` for fine pointers only; on touch devices show the static cover.

## Self-hosted video clips (`type: "video"`)

For short clips Henry exports himself (MP4). Same `LoopVideo` component when `loop: true`; otherwise a native `<video controls>` with poster and `preload="metadata"`. Over 15 MB → put it on YouTube instead (the build warns).

## Hero reel (optional)

If Henry provides a showreel cut, the Home hero can play a muted, ≤ 10 s, ≤ 1.5 MB loop (WebM + MP4, 1280px) behind the name, with a dark gradient for contrast. The poster image is the LCP element, so performance is unaffected. Off under reduced motion; never on Save-Data connections (`navigator.connection.saveData`).

## Media checklist for each new project

- [ ] `cover.jpg` — 16:9, ≥ 1600px, readable at thumbnail size, no baked-in text.
- [ ] `coverLoop` — 3–5 s seamless loop of the core mechanic (optional but high-impact).
- [ ] 1 YouTube video (trailer or, better, a gameplay capture showing Henry's systems).
- [ ] 2–6 images/GIFs that prove specific contributions, each with alt text and a caption saying what it shows.
- [ ] Credits/rights confirmed for any studio-owned assets.
