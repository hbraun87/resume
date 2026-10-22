// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context2D } from '../../src/lib/finale';
import { browserEnv, initHome, type HomeEnv } from '../../src/lib/home';
import { KONAMI } from '../../src/lib/konami';
import { must } from '../must';
import { fakeContext } from '../fake-context';

const PAGE = `
  <header><nav data-nav>
    <a href="/#profile">Profile</a><a href="/#games">Games</a><a href="/#contact">Contact</a>
  </nav></header>
  <section id="boot" data-stage="Booting player profile">
    <div data-boot><p><span data-type>mount a.pak</span> <span data-type-tag>[OK]</span></p></div>
  </section>
  <section id="profile" data-stage="Loading character sheet"></section>
  <section id="games" data-stage="Streaming levels" data-stage-total="2">
    <div data-filters hidden><button data-filter="all" aria-pressed="true">All</button><button data-filter="vr" data-label="VR">VR</button></div>
    <p data-filter-status></p>
    <ul>
      <li data-platform="vr" data-asset="level" data-asset-name="Until You Fall"></li>
      <li data-platform="pc" data-asset="level" data-asset-name="Toren"></li>
    </ul>
  </section>
  <section id="research" data-stage="Compiling research shaders">
    <ul><li data-asset="shader" data-asset-name="Sky Rendering"></li></ul>
  </section>
  <section id="contact" data-stage="Finalizing">
    <p><span data-finale-state>Waiting for load…</span></p>
    <div data-finale data-headline="Let's build the next one." data-name="Henry Braun">
      <span data-finale-pct>0%</span><canvas></canvas>
    </div>
    <span data-email>henry@example.com</span>
    <button data-copy hidden>Copy</button>
    <a href="mailto:henry@example.com" class="start" data-start>Press start</a>
  </section>
  <div data-hud data-tips='["Tip one","Tip two"]' hidden>
    <span data-hud-pct>0</span><span data-hud-stage></span><span data-hud-tip>Tip one</span>
    <div data-hud-bar role="progressbar" aria-valuenow="0"><span data-hud-fill></span></div>
    <a href="#contact"><span data-hud-cta>Loading…</span></a>
  </div>
  <div data-toasts></div>
  <div data-flash></div>`;

interface FakeObserver {
  callback: (entries: { target: Element; isIntersecting: boolean }[]) => void;
  threshold: number;
  targets: Set<Element>;
}

function harness(options: { reduceMotion?: boolean; canvas?: boolean; html?: string } = {}) {
  document.body.innerHTML = options.html ?? PAGE;
  const observers: FakeObserver[] = [];
  let frames: ((time: number) => void)[] = [];
  let now = 0;
  const main = fakeContext();
  const env: HomeEnv = {
    win: window,
    reduceMotion: options.reduceMotion ?? false,
    observe: (callback, threshold) => {
      const observer: FakeObserver = { callback, threshold, targets: new Set() };
      observers.push(observer);
      return {
        observe: (target) => observer.targets.add(target),
        unobserve: (target) => observer.targets.delete(target),
      };
    },
    raf: (callback) => frames.push(callback),
    now: () => now,
    random: () => 0.5,
    context: () => (options.canvas === false ? null : main.context),
    scratch: () => fakeContext().context,
  };
  const flush = (count = 1) => {
    for (let i = 0; i < count; i += 1) {
      const pending = frames;
      frames = [];
      now += 16;
      for (const frame of pending) frame(now);
    }
  };
  const settle = () => flush(80);
  const fire = (threshold: number, targets: Element[], isIntersecting = true) => {
    const observer = must(
      observers.find((o) => o.threshold === threshold),
      `observer ${threshold}`,
    );
    observer.callback(targets.map((target) => ({ target, isIntersecting })));
  };
  return { env, flush, settle, fire, observers, main, pending: () => frames.length };
}

const $ = (selector: string) => must(document.querySelector<HTMLElement>(selector), selector);
const text = (selector: string) => $(selector).textContent;

function scrollTo(y: number, height = 5000, viewport = 1000) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: viewport, configurable: true });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: height,
    configurable: true,
  });
  window.dispatchEvent(new Event('scroll'));
}

/** Gives each section a document position: boot 0, profile 1000, games 2000, ... */
function layoutSections() {
  document.querySelectorAll<HTMLElement>('[data-stage]').forEach((section, i) => {
    section.getBoundingClientRect = () => ({ top: i * 1000 - window.scrollY }) as DOMRect;
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  scrollTo(0);
  document.documentElement.className = '';
});
afterEach(() => {
  vi.useRealTimers();
});

describe('initHome', () => {
  it('does nothing on a page without stages or a HUD', () => {
    document.body.innerHTML = '<main></main>';
    expect(initHome(document, harness({ html: '<main></main>' }).env)).toBeNull();
    expect(
      initHome(document, harness({ html: '<section data-stage="x"></section>' }).env),
    ).toBeNull();
  });

  it('shows the HUD and fills it as the page scrolls', () => {
    const h = harness({ reduceMotion: true });
    layoutSections();
    const home = must(initHome(document, h.env), 'home');
    expect($('[data-hud]').hidden).toBe(false);
    expect(document.documentElement.classList.contains('has-hud')).toBe(true);
    expect(text('[data-hud-stage]')).toBe('Booting player profile');

    scrollTo(1100);
    h.flush();
    expect(home.progress).toBeCloseTo(0.275);
    expect(text('[data-hud-pct]')).toBe('28');
    expect(text('[data-finale-pct]')).toBe('28%');
    expect($('[data-hud-bar]').getAttribute('aria-valuenow')).toBe('28');
    expect($('[data-hud-fill]').style.clipPath).toBe('inset(0 72.5% 0 0)');
    expect(text('[data-hud-stage]')).toBe('Loading character sheet');
    expect($('a[href="/#profile"]').getAttribute('aria-current')).toBe('true');
    expect($('a[href="/#games"]').hasAttribute('aria-current')).toBe(false);

    scrollTo(1700);
    expect(text('[data-hud-stage]')).toBe('Streaming levels (0/2)');
  });

  it('eases the shown percentage toward the real one', () => {
    const h = harness();
    layoutSections();
    const home = must(initHome(document, h.env), 'home');
    scrollTo(2000);
    h.flush();
    expect(home.shown).toBeCloseTo(0.09);
    h.settle();
    expect(home.shown).toBe(0.5);
    expect(h.pending()).toBe(0);
  });

  it('counts each game card once as it streams in', () => {
    const h = harness();
    layoutSections();
    const home = must(initHome(document, h.env), 'home');
    scrollTo(2100);
    const [first, second] = [...document.querySelectorAll('[data-asset="level"]')];
    h.fire(0.35, [must(first, 'card')]);
    h.fire(0.35, [must(second, 'card')], false);
    expect(home.streamed).toBe(1);
    expect(text('[data-hud-stage]')).toBe('Streaming levels (1/2)');
    h.fire(0.35, [must(second, 'card')]);
    expect(home.streamed).toBe(2);
    const observer = must(
      h.observers.find((o) => o.threshold === 0.35),
      'observer',
    );
    expect(observer.targets.size).toBe(0);
  });

  it('completes as soon as most of the finale is on screen', () => {
    const h = harness();
    layoutSections();
    const home = must(initHome(document, h.env), 'home');
    let top = 1200;
    $('[data-finale]').getBoundingClientRect = () => ({ top, height: 400 }) as DOMRect;
    scrollTo(1000);
    expect(home.done).toBe(false);
    top = 750; // 250 of 400 px showing: not yet
    scrollTo(1100);
    expect(home.done).toBe(false);
    top = 700; // 300 of 400 px showing
    scrollTo(1200);
    expect(home.done).toBe(true);
  });

  it('still completes at the bottom without a finale', () => {
    const h = harness();
    $('[data-finale]').remove();
    layoutSections();
    const home = must(initHome(document, h.env), 'home');
    scrollTo(3999);
    expect(home.done).toBe(true);
  });

  it('completes once at the bottom: HUD, labels, burst, flash and toast', () => {
    const h = harness();
    layoutSections();
    const home = must(initHome(document, h.env), 'home');
    h.fire(0, [$('canvas')]);
    scrollTo(3999);
    expect(home.done).toBe(true);
    expect($('[data-hud]').classList.contains('is-done')).toBe(true);
    expect(text('[data-hud-cta]')).toBe('Press start ▸');
    expect(text('[data-finale-state]')).toBe('Load complete');
    expect(text('[data-hud-stage]')).toBe('Load complete');
    vi.advanceTimersByTime(350);
    expect(home.finale?.phase).toBe('burst');
    expect($('[data-flash]').classList.contains('is-flashing')).toBe(true);
    expect($('[data-finale]').classList.contains('is-shaking')).toBe(true);
    expect(text('[data-toasts] .toast-title')).toBe('Completionist');
    expect(text('[data-toasts] .toast-detail')).toBe(
      'Loaded 100% of Henry Braun. Next up: your project.',
    );
    scrollTo(0);
    h.settle();
    expect(home.shown).toBe(1);
    home.complete();
    expect(text('[data-toasts] .toast-title')).toBe('Completionist');
  });

  it('skips flash and shake under reduced motion and snaps the particles', () => {
    const h = harness({ reduceMotion: true });
    layoutSections();
    const home = must(initHome(document, h.env), 'home');
    home.complete();
    vi.advanceTimersByTime(350);
    expect(home.finale?.phase).toBe('form');
    expect($('[data-flash]').classList.contains('is-flashing')).toBe(false);
    expect($('[data-boot] [data-type]').textContent).toBe('mount a.pak');
    expect(document.querySelector('.type-rest')).toBeNull();
  });

  it('types the boot console when motion is allowed', () => {
    const h = harness();
    initHome(document, h.env);
    expect(document.querySelector('.type-rest')).not.toBeNull();
    vi.advanceTimersByTime(2000);
    expect(document.querySelector('.type-rest')).toBeNull();
  });

  it('draws the finale only while it is on screen and follows the pointer', async () => {
    const h = harness();
    layoutSections();
    Object.defineProperty(document, 'fonts', {
      value: { ready: Promise.resolve() },
      configurable: true,
    });
    const canvas = $('canvas');
    Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 400, configurable: true });
    const home = must(initHome(document, h.env), 'home');
    await Promise.resolve();
    await Promise.resolve();
    const finale = must(home.finale, 'finale');
    expect($('[data-finale]').classList.contains('is-live')).toBe(true);
    expect(finale.width).toBe(800);
    h.settle();
    expect(h.pending()).toBe(0);
    h.fire(0, [canvas]);
    h.flush(3);
    expect(h.pending()).toBe(1);
    h.main.fills.length = 0;
    h.flush();
    expect(h.main.fills.length).toBeGreaterThan(0);
    h.fire(0, [canvas], false);
    h.flush(2);
    expect(h.pending()).toBe(0);

    canvas.dispatchEvent(
      Object.assign(new MouseEvent('pointermove'), { offsetX: 12, offsetY: 34 }),
    );
    expect(finale.pointer).toEqual({ x: 12, y: 34 });
    canvas.dispatchEvent(new MouseEvent('pointerleave'));
    expect(finale.pointer).toBeNull();

    Object.defineProperty(canvas, 'clientWidth', { value: 500, configurable: true });
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(150);
    expect(finale.width).toBe(500);
    Reflect.deleteProperty(document, 'fonts');
  });

  it('re-reads theme colors at most four times a second', () => {
    const h = harness();
    const home = must(initHome(document, h.env), 'home');
    const finale = must(home.finale, 'finale');
    finale.resize(400, 200, 1);
    const read = vi.spyOn(window, 'getComputedStyle');
    finale.draw(0);
    finale.draw(0);
    expect(read).toHaveBeenCalledTimes(1);
    h.flush(20);
    finale.draw(0);
    expect(read).toHaveBeenCalledTimes(2);
    read.mockRestore();
  });

  it('keeps the headline as text when there is no canvas context', () => {
    const h = harness({ canvas: false });
    const home = must(initHome(document, h.env), 'home');
    expect(home.finale).toBeNull();
    expect($('[data-finale]').classList.contains('is-live')).toBe(false);
    home.complete();
    vi.advanceTimersByTime(350);
    h.settle();
    expect(text('[data-hud-pct]')).toBe('100');
  });

  it('rotates loading tips, fading unless motion is reduced', () => {
    harnessInit();
    vi.advanceTimersByTime(6500);
    expect($('[data-hud-tip]').classList.contains('is-fading')).toBe(true);
    vi.advanceTimersByTime(250);
    expect(text('[data-hud-tip]')).toBe('Tip two');
    expect($('[data-hud-tip]').classList.contains('is-fading')).toBe(false);

    harnessInit(true);
    vi.advanceTimersByTime(6500);
    expect(text('[data-hud-tip]')).toBe('Tip two');
    vi.advanceTimersByTime(6500);
    expect(text('[data-hud-tip]')).toBe('Tip one');

    function harnessInit(reduceMotion = false) {
      initHome(document, harness({ reduceMotion }).env);
    }
  });

  it('filters cards and re-measures the page', () => {
    const h = harness();
    initHome(document, h.env);
    expect($('[data-filters]').hidden).toBe(false);
    $('[data-filter="vr"]').click();
    expect($('[data-platform="pc"]').hidden).toBe(true);
    expect(text('[data-filter-status]')).toBe('Showing 1 VR title');
  });

  it('copies the email and resets the button label', async () => {
    const h = harness();
    initHome(document, h.env);
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const copy = $('[data-copy]');
    expect(copy.hidden).toBe(false);
    copy.click();
    await vi.waitFor(() => expect(copy.textContent).toBe('Copied'));
    expect(writeText).toHaveBeenCalledWith('henry@example.com');
    vi.advanceTimersByTime(2200);
    expect(copy.textContent).toBe('Copy');

    writeText.mockRejectedValueOnce(new Error('denied'));
    copy.click();
    await vi.waitFor(() => expect(copy.textContent).toBe('Selected, copy now'));
  });

  it('PRESS START stays a mail link, copies the address, completes the load, then re-bursts', async () => {
    const h = harness();
    layoutSections();
    const home = must(initHome(document, h.env), 'home');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async () => {} },
      configurable: true,
    });
    const start = $('a[data-start]');
    expect(start.getAttribute('href')).toBe('mailto:henry@example.com');
    // jsdom cannot open a mail app; stop the navigation after the page's handler runs.
    let opened = 0;
    const open = (event: Event) => {
      opened += 1;
      event.preventDefault();
    };
    document.addEventListener('click', open);
    start.click();
    await vi.waitFor(() =>
      expect(text('[data-toasts] .toast-title')).toBe('Opening your mail app'),
    );
    expect(opened).toBe(1);
    expect(text('[data-toasts] .toast-kicker')).toBe('Player 2 has joined');
    expect(text('[data-toasts] .toast-detail')).toBe(
      'henry@example.com · also copied, in case nothing opens.',
    );
    expect(home.done).toBe(true);
    vi.advanceTimersByTime(350);
    // The burst plays, but the Completionist toast does not cover the email.
    expect(home.finale?.phase).toBe('burst');
    expect(text('[data-toasts] .toast-kicker')).toBe('Player 2 has joined');
    must(home.finale, 'finale').phase = 'form';

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async () => Promise.reject(new Error('no')) },
      configurable: true,
    });
    start.click();
    await vi.waitFor(() =>
      expect(text('[data-toasts] .toast-detail')).toBe(
        'henry@example.com · selected, in case nothing opens.',
      ),
    );
    expect(home.finale?.phase).toBe('burst');
    document.removeEventListener('click', open);
  });

  it('toggles party mode with the Konami code', () => {
    const h = harness();
    const home = must(initHome(document, h.env), 'home');
    const scrolled = vi.fn();
    $('[data-finale]').scrollIntoView = scrolled;
    const type = () => {
      for (const key of KONAMI) document.dispatchEvent(new KeyboardEvent('keydown', { key }));
    };
    type();
    expect(home.party).toBe(true);
    expect(home.finale?.party).toBe(true);
    expect(home.done).toBe(true);
    expect(scrolled).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    expect(text('[data-toasts] .toast-title')).toBe('Party mode on');
    type();
    expect(home.party).toBe(false);
    expect(text('[data-toasts] .toast-title')).toBe('Party mode off');
  });

  it('jumps without smooth scrolling under reduced motion and copes with a bare page', () => {
    const h = harness({
      reduceMotion: true,
      html: '<section id="a" data-stage="Booting"></section><div data-hud></div>',
    });
    const home = must(initHome(document, h.env), 'home');
    for (const key of KONAMI) document.dispatchEvent(new KeyboardEvent('keydown', { key }));
    expect(home.party).toBe(true);
    home.complete();
    vi.advanceTimersByTime(350);
    vi.advanceTimersByTime(6500);
    h.settle();
    expect(home.finale).toBeNull();
  });

  it('honours a scroll restored to the bottom before the first frame', () => {
    scrollTo(4000);
    const h = harness({ reduceMotion: true });
    const home = must(initHome(document, h.env), 'home');
    expect(home.done).toBe(true);
    h.flush();
    expect(text('[data-hud-pct]')).toBe('100');
  });
});

describe('browserEnv', () => {
  it('wraps the real browser APIs', () => {
    const env = browserEnv(window);
    expect(typeof env.reduceMotion).toBe('boolean');
    expect(env.now()).toBeGreaterThanOrEqual(0);
    expect(env.random()).toBeLessThan(1);
    const handle = env.raf(() => {});
    expect(handle).toBeDefined();
    const observer = env.observe(() => {}, 0.5);
    expect(typeof observer.observe).toBe('function');
    const canvas = document.createElement('canvas');
    expect(env.context(canvas)).toBeNull();
    const scratch: Context2D | null = env.scratch(10, 20);
    expect(scratch).toBeNull();
    env.scratch(30, 40);
  });

  it('defaults to the global window', () => {
    expect(browserEnv().win).toBe(window);
  });
});
