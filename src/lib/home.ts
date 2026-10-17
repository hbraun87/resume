// Wires the loading-screen home page (docs/brief/10-loading-screen-spec.md).
// The page is complete HTML without this script; it adds the HUD, filters,
// the typing console, the finale canvas, copy and toasts.
import { copyText, linkToButton } from './clipboard';
import { Finale, type Context2D } from './finale';
import { enhanceFilters } from './filter';
import { COMPLETE_AT, currentOf, easeToward, nextTip, scrollProgress, stageLabel } from './hud';
import { konamiListener } from './konami';
import { showToast } from './toast';
import { typeLines } from './typing';

interface Observer {
  observe(target: Element): void;
  unobserve(target: Element): void;
}

export interface HomeEnv {
  win: Window;
  reduceMotion: boolean;
  /** An IntersectionObserver-like factory; tests pass a fake. */
  observe: (
    callback: (entries: { target: Element; isIntersecting: boolean }[]) => void,
    threshold: number,
  ) => Observer;
  raf: (callback: (time: number) => void) => number;
  now: () => number;
  random: () => number;
  context: (canvas: HTMLCanvasElement) => Context2D | null;
  scratch: (width: number, height: number) => Context2D;
}

export function browserEnv(win: Window = window): HomeEnv {
  let scratchCanvas: HTMLCanvasElement | null = null;
  return {
    win,
    reduceMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    observe: (callback, threshold) => new IntersectionObserver(callback, { threshold }),
    raf: (callback) => win.requestAnimationFrame(callback),
    now: () => win.performance.now(),
    random: Math.random,
    context: (canvas) => canvas.getContext('2d'),
    scratch: (width, height) => {
      scratchCanvas ??= win.document.createElement('canvas');
      scratchCanvas.width = width;
      scratchCanvas.height = height;
      // Only reached after context() succeeded on the real canvas.
      return scratchCanvas.getContext('2d', { willReadFrequently: true }) as Context2D;
    },
  };
}

const TIP_MS = 6500;
const COMPLETE_DELAY_MS = 350;
const LABEL_RESET_MS = 2200;

export interface Home {
  readonly done: boolean;
  readonly progress: number;
  readonly shown: number;
  readonly streamed: number;
  readonly party: boolean;
  readonly finale: Finale | null;
  measure(): void;
  complete(): void;
  frame(time: number): void;
}

export function initHome(doc: Document = document, env: HomeEnv = browserEnv()): Home | null {
  const sections = [...doc.querySelectorAll<HTMLElement>('[data-stage]')];
  const [firstSection] = sections;
  const hud = doc.querySelector<HTMLElement>('[data-hud]');
  if (!firstSection || !hud) return null;
  const first: HTMLElement = firstSection;
  const panel: HTMLElement = hud;
  const { win, reduceMotion } = env;
  const root = doc.documentElement;
  const $ = <T extends Element = HTMLElement>(selector: string) => doc.querySelector<T>(selector);

  const pct = $('[data-hud-pct]');
  const fill = $('[data-hud-fill]');
  const bar = $('[data-hud-bar]');
  const stage = $('[data-hud-stage]');
  const tip = $('[data-hud-tip]');
  const cta = $('[data-hud-cta]');
  const toasts = $('[data-toasts]');
  const flash = $('[data-flash]');
  const finaleStage = $('[data-finale]');
  const finalePct = $('[data-finale-pct]');
  const navLinks = [...doc.querySelectorAll<HTMLAnchorElement>('[data-nav] a[href*="#"]')];

  let progress = 0;
  let shown = 0;
  let done = false;
  let streamed = 0;
  let currentSection = first;
  let party = false;
  let tops: { section: HTMLElement; top: number }[] = [];
  let finaleVisible = false;
  let looping = false;

  hud.hidden = false;
  root.classList.add('has-hud');

  const toast = (kicker: string, title: string, detail?: string) => {
    if (toasts) showToast(toasts, { kicker, title, detail }, 4200, win);
  };

  // The finale canvas. Without a 2D context the headline stays as text.
  let finale: Finale | null = null;
  const canvas = finaleStage?.querySelector('canvas') ?? null;
  const context = canvas ? env.context(canvas) : null;
  if (finaleStage && canvas && context) {
    let colorsAt = -Infinity;
    let colors = { accent: '', text: '', muted: '' };
    const style = win.getComputedStyle(root);
    finale = new Finale(canvas, context, {
      text: finaleStage.dataset['headline'] ?? '',
      font: style.getPropertyValue('--font-display').trim() || 'sans-serif',
      reduceMotion,
      random: env.random,
      scratch: env.scratch,
      colors: () => {
        // Re-read a few times a second so the theme toggle reaches the canvas.
        if (env.now() - colorsAt > 250) {
          const live = win.getComputedStyle(root);
          colors = {
            accent: live.getPropertyValue('--wolf').trim(),
            text: live.getPropertyValue('--bone').trim(),
            muted: live.getPropertyValue('--dim').trim(),
          };
          colorsAt = env.now();
        }
        return colors;
      },
    });
    const sized = finale;
    const resize = () => {
      sized.resize(canvas.clientWidth, canvas.clientHeight, win.devicePixelRatio);
      sized.draw(env.now());
    };
    finaleStage.classList.add('is-live');
    void (doc.fonts?.ready ?? Promise.resolve()).then(resize);
    let resizeTimer = 0;
    win.addEventListener('resize', () => {
      win.clearTimeout(resizeTimer);
      resizeTimer = win.setTimeout(resize, 150);
    });
    canvas.addEventListener('pointermove', (event) => {
      sized.pointer = { x: event.offsetX, y: event.offsetY };
    });
    canvas.addEventListener('pointerleave', () => {
      sized.pointer = null;
    });
    env
      .observe((entries) => {
        finaleVisible = entries.some((entry) => entry.isIntersecting);
        schedule();
      }, 0)
      .observe(canvas);
  }

  function schedule(): void {
    if (looping) return;
    looping = true;
    env.raf(frame);
  }

  function frame(time: number): void {
    const target = done ? 1 : progress;
    shown = easeToward(shown, target, reduceMotion);
    const value = Math.round(shown * 100);
    if (pct) pct.textContent = String(value);
    if (finalePct) finalePct.textContent = `${value}%`;
    // Clipping keeps the stripes undistorted, unlike scaleX.
    if (fill) fill.style.clipPath = `inset(0 ${100 - shown * 100}% 0 0)`;
    bar?.setAttribute('aria-valuenow', String(value));
    if (finale) {
      finale.progress = shown;
      if (finaleVisible) finale.frame(time);
    }
    looping = false;
    if (shown !== target || finaleVisible) schedule();
  }

  const label = () => {
    const { stage: name = '', stageTotal } = currentSection.dataset;
    const text = stageLabel(
      { stage: name, total: Number(stageTotal) || undefined },
      streamed,
      done,
    );
    if (stage) stage.textContent = text;
  };

  function measure(): void {
    tops = sections.map((section) => ({
      section,
      top: section.getBoundingClientRect().top + win.scrollY,
    }));
    onScroll();
  }

  function onScroll(): void {
    progress = scrollProgress(win.scrollY, root.scrollHeight, win.innerHeight);
    currentSection = currentOf(tops, win.scrollY + win.innerHeight * 0.45, first);
    for (const link of navLinks) {
      if (link.hash === `#${currentSection.id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    label();
    if (progress >= COMPLETE_AT) complete();
    schedule();
  }

  function burstNow(): void {
    finale?.explode(env.now());
    if (finaleVisible) schedule();
    if (reduceMotion) return;
    flash?.classList.remove('is-flashing');
    finaleStage?.classList.remove('is-shaking');
    // Reading layout restarts the CSS animations.
    void flash?.offsetWidth;
    flash?.classList.add('is-flashing');
    finaleStage?.classList.add('is-shaking');
  }

  function complete(): void {
    if (done) return;
    done = true;
    panel.classList.add('is-done');
    if (cta) cta.textContent = 'Press start ▸';
    for (const state of doc.querySelectorAll('[data-finale-state]')) {
      state.textContent = 'Load complete';
    }
    label();
    schedule();
    win.setTimeout(() => {
      burstNow();
      toast(
        'Achievement unlocked',
        'Completionist',
        `Loaded 100% of ${finaleStage?.dataset['name'] ?? ''}. Next up: your project.`,
      );
    }, COMPLETE_DELAY_MS);
  }

  // Loading tips rotate with a short fade.
  const tips = JSON.parse(hud.dataset['tips'] ?? '[]') as string[];
  let tipIndex = 0;
  if (tip && tips.length > 1) {
    win.setInterval(() => {
      tipIndex = nextTip(tipIndex, tips.length);
      const swap = () => {
        tip.textContent = tips[tipIndex] ?? '';
        tip.classList.remove('is-fading');
      };
      if (reduceMotion) swap();
      else {
        tip.classList.add('is-fading');
        win.setTimeout(swap, 250);
      }
    }, TIP_MS);
  }

  // "Streaming levels (N/21)": each game card counts once as it enters the screen.
  const levels = env.observe((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      levels.unobserve(target);
      streamed += 1;
    }
    label();
  }, 0.35);
  for (const card of doc.querySelectorAll('[data-asset="level"]')) levels.observe(card);

  const filters = $('[data-filters]');
  if (filters) {
    const cards = [...doc.querySelectorAll<HTMLElement>('[data-platform]')];
    enhanceFilters(filters, cards, $('[data-filter-status]'), measure);
  }

  const boot = $('[data-boot]');
  if (boot && !reduceMotion) void typeLines(boot, { timers: win });

  // Copy the email, with a select-text fallback.
  const email = $('[data-email]');
  const address = email?.textContent?.trim() ?? '';
  const copy = $<HTMLButtonElement>('[data-copy]');
  if (copy && email) {
    const idle = copy.textContent ?? '';
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const result = await copyText(address, email);
      copy.textContent = result === 'copied' ? 'Copied' : 'Selected, copy now';
      win.setTimeout(() => {
        copy.textContent = idle;
      }, LABEL_RESET_MS);
    });
  }

  const start = $<HTMLAnchorElement>('a[data-start]');
  if (start && email) {
    const button = linkToButton(start);
    button.addEventListener('click', async () => {
      const result = await copyText(address, email);
      toast(
        'Player 2 has joined',
        result === 'copied' ? 'Email copied to clipboard' : 'Email selected',
        `${address} · paste it into your mail app and say hi.`,
      );
      if (done) burstNow();
      else complete();
    });
  }

  doc.addEventListener(
    'keydown',
    konamiListener(() => {
      party = !party;
      if (finale) finale.party = party;
      complete();
      finaleStage?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      toast('Secret found', `Party mode ${party ? 'on' : 'off'}`, 'Old cheat codes never die.');
    }),
  );

  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('resize', measure);
  win.addEventListener('load', measure);
  void doc.fonts?.ready.then(measure);
  measure();

  return {
    get done() {
      return done;
    },
    get progress() {
      return progress;
    },
    get shown() {
      return shown;
    },
    get streamed() {
      return streamed;
    },
    get party() {
      return party;
    },
    finale,
    measure,
    complete,
    frame,
  };
}
