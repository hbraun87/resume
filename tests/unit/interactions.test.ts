// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copyText, linkToButton, selectText } from '../../src/lib/clipboard';
import { applyFilter, enhanceFilters } from '../../src/lib/filter';
import { KONAMI, konamiListener } from '../../src/lib/konami';
import { showToast } from '../../src/lib/toast';
import { typeLines } from '../../src/lib/typing';
import { must } from '../must';

const key = (k: string, init: KeyboardEventInit = {}) =>
  new KeyboardEvent('keydown', { key: k, ...init });

beforeEach(() => {
  document.body.innerHTML = '';
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('konamiListener', () => {
  it('fires on the full sequence, case-insensitively, and can fire again', () => {
    const hit = vi.fn();
    const listen = konamiListener(hit);
    for (const k of KONAMI) listen(key(k.length === 1 ? k.toUpperCase() : k));
    expect(hit).toHaveBeenCalledTimes(1);
    for (const k of KONAMI) listen(key(k));
    expect(hit).toHaveBeenCalledTimes(2);
  });

  it('restarts on a wrong key, and a third ↑ keeps the start', () => {
    const hit = vi.fn();
    const listen = konamiListener(hit);
    for (const k of ['ArrowUp', 'ArrowUp', 'x', ...KONAMI.slice(0, 4), 'ArrowUp']) listen(key(k));
    expect(hit).not.toHaveBeenCalled();
    for (const k of ['ArrowUp', ...KONAMI]) listen(key(k));
    expect(hit).toHaveBeenCalledTimes(1);
    for (const k of ['ArrowUp', 'ArrowUp', 'ArrowUp', ...KONAMI.slice(2)]) listen(key(k));
    expect(hit).toHaveBeenCalledTimes(2);
  });

  it('ignores keys pressed with a modifier', () => {
    const hit = vi.fn();
    const listen = konamiListener(hit);
    for (const k of KONAMI) listen(key(k));
    for (const k of KONAMI.slice(0, -1)) listen(key(k));
    listen(key('a', { ctrlKey: true }));
    listen(key('a', { metaKey: true }));
    listen(key('a', { altKey: true }));
    expect(hit).toHaveBeenCalledTimes(1);
    listen(key('a'));
    expect(hit).toHaveBeenCalledTimes(2);
  });
});

describe('showToast', () => {
  it('shows one toast at a time and removes it after the duration', () => {
    const region = document.createElement('div');
    showToast(region, { kicker: 'Old', title: 'First' });
    const toast = showToast(
      region,
      { kicker: 'Secret found', title: 'Party mode on', detail: 'Hi' },
      1000,
    );
    expect(region.children).toHaveLength(1);
    expect([...toast.children].map((p) => [p.className, p.textContent])).toEqual([
      ['toast-kicker mono', 'Secret found'],
      ['toast-title', 'Party mode on'],
      ['toast-detail', 'Hi'],
    ]);
    vi.advanceTimersByTime(1000);
    expect(region.children).toHaveLength(0);
  });

  it('leaves out an empty detail line', () => {
    const toast = showToast(document.createElement('div'), { kicker: 'A', title: 'B' });
    expect(toast.children).toHaveLength(2);
  });
});

describe('copyText', () => {
  const email = () => {
    document.body.innerHTML = '<span id="e">henry@example.com</span>';
    return must(document.getElementById('e'), 'email');
  };

  it('copies with the clipboard API', async () => {
    const writeText = vi.fn(async () => {});
    expect(await copyText('henry@example.com', email(), { writeText })).toBe('copied');
    expect(writeText).toHaveBeenCalledWith('henry@example.com');
  });

  it('selects the text when the clipboard refuses or is missing', async () => {
    const node = email();
    const refuse = { writeText: async () => Promise.reject(new Error('denied')) };
    expect(await copyText('x', node, refuse)).toBe('selected');
    expect(getSelection()?.toString()).toBe('henry@example.com');
    getSelection()?.removeAllRanges();
    expect(await copyText('x', node, null)).toBe('selected');
    expect(getSelection()?.toString()).toBe('henry@example.com');
  });

  it('uses the browser clipboard by default', async () => {
    const node = email();
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    expect(await copyText('henry@example.com', node)).toBe('copied');
  });
});

describe('selectText', () => {
  it('does nothing without a selection object', () => {
    document.body.innerHTML = '<span>x</span>';
    expect(() => selectText(must(document.querySelector('span'), 'span'), null)).not.toThrow();
  });
});

describe('linkToButton', () => {
  it('keeps attributes and children but drops the href', () => {
    document.body.innerHTML =
      '<a href="mailto:x" class="start" data-start data-astro-cid-1><b>Press start</b></a>';
    const button = linkToButton(must(document.querySelector('a'), 'link'));
    expect(document.querySelector('a')).toBeNull();
    expect(button.type).toBe('button');
    expect(button.hasAttribute('href')).toBe(false);
    expect(button.className).toBe('start');
    expect(button.hasAttribute('data-astro-cid-1')).toBe(true);
    expect(button.innerHTML).toBe('<b>Press start</b>');
  });
});

describe('typeLines', () => {
  const consoleHtml = `
    <div id="c">
      <p><span data-type>mount a.pak</span> <span data-type-tag>[OK]</span></p>
      <p><span data-type>go</span></p>
    </div>`;

  it('types each line in order, then shows its tag', async () => {
    document.body.innerHTML = consoleHtml;
    const root = must(document.getElementById('c'), 'console');
    const done = typeLines(root, { charsPerTick: 4, tickMs: 10, linePauseMs: 50 });
    const [first, second] = [...root.querySelectorAll<HTMLElement>('[data-type]')];
    const tag = must(root.querySelector('[data-type-tag]'), 'tag');
    expect(first?.textContent).toBe('mount a.pak');
    expect(first?.querySelector('.type-rest')?.textContent).toBe('mount a.pak');
    expect(tag.classList.contains('type-pending')).toBe(true);
    vi.advanceTimersByTime(10);
    expect(first?.firstElementChild?.textContent).toBe('moun');
    vi.advanceTimersByTime(20);
    expect(first?.querySelector('.type-rest')).toBeNull();
    expect(tag.classList.contains('type-pending')).toBe(false);
    expect(second?.firstElementChild?.textContent).toBe('');
    vi.advanceTimersByTime(60);
    expect(second?.textContent).toBe('go');
    vi.advanceTimersByTime(50);
    await expect(done).resolves.toBeUndefined();
  });

  it('uses the spec timing by default and resolves at once with no lines', async () => {
    document.body.innerHTML = '<div id="c"><p><span data-type></span></p></div>';
    const done = typeLines(must(document.getElementById('c'), 'console'));
    vi.advanceTimersByTime(130);
    await expect(done).resolves.toBeUndefined();
    await expect(typeLines(document.createElement('div'))).resolves.toBeUndefined();
  });
});

describe('filters', () => {
  const html = `
    <div data-filters hidden>
      <button data-filter="all" aria-pressed="true">All</button>
      <button data-filter="vr" data-label="VR" aria-pressed="false">VR</button>
      <button data-filter="ar" data-label="AR" aria-pressed="false">AR</button>
      <button data-filter aria-pressed="false">Odd</button>
    </div>
    <p id="status"></p>
    <ul><li data-platform="vr"></li><li data-platform="vr"></li><li data-platform="ar"></li><li data-platform="pc"></li></ul>`;
  const setup = (withStatus = true) => {
    document.body.innerHTML = html;
    const group = must(document.querySelector<HTMLElement>('[data-filters]'), 'group');
    const cards = [...document.querySelectorAll<HTMLElement>('[data-platform]')];
    const status = withStatus ? document.getElementById('status') : null;
    const changed = vi.fn();
    enhanceFilters(group, cards, status, changed);
    const button = (value: string) =>
      must(document.querySelector<HTMLButtonElement>(`[data-filter="${value}"]`), value);
    return { group, cards, changed, button };
  };

  it('applyFilter shows one group or all', () => {
    const cards = [1, 2].map(() => document.createElement('li'));
    must(cards[0], 'card').dataset['platform'] = 'vr';
    expect(applyFilter(cards, 'vr')).toBe(1);
    expect(cards.map((c) => c.hidden)).toEqual([false, true]);
    expect(applyFilter(cards, 'all')).toBe(2);
  });

  it('reveals the buttons, filters, presses one button and announces the count', () => {
    const { group, cards, changed, button } = setup();
    expect(group.hidden).toBe(false);
    button('vr').click();
    expect(cards.filter((c) => !c.hidden)).toHaveLength(2);
    expect(button('vr').getAttribute('aria-pressed')).toBe('true');
    expect(button('all').getAttribute('aria-pressed')).toBe('false');
    expect(document.getElementById('status')?.textContent).toBe('Showing 2 VR titles');
    expect(changed).toHaveBeenCalledTimes(1);
    button('ar').click();
    expect(document.getElementById('status')?.textContent).toBe('Showing 1 AR title');
    button('all').click();
    expect(document.getElementById('status')?.textContent).toBe('Showing 4 titles');
  });

  it('treats an empty filter as all and works without a status or callback', () => {
    document.body.innerHTML = html;
    const group = must(document.querySelector<HTMLElement>('[data-filters]'), 'group');
    const cards = [...document.querySelectorAll<HTMLElement>('[data-platform]')];
    enhanceFilters(group, cards, null);
    must(document.querySelector<HTMLButtonElement>('[data-filter=""]'), 'odd').click();
    expect(cards.every((c) => !c.hidden)).toBe(true);
    const { button } = setup(false);
    expect(() => button('vr').click()).not.toThrow();
  });
});
