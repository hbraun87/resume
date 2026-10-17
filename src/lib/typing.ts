// The boot console types its lines; the text is in the HTML from the start, so
// nothing shifts and the console is complete without JavaScript.

export interface TypingOptions {
  charsPerTick?: number;
  tickMs?: number;
  linePauseMs?: number;
  timers?: Pick<Window, 'setTimeout'>;
}

/**
 * Types each `[data-type]` element under root in order. Untyped text stays in
 * place but invisible; the line's `[data-type-tag]` appears when it finishes.
 * Resolves when every line is done.
 */
export function typeLines(root: ParentNode, options: TypingOptions = {}): Promise<void> {
  const { charsPerTick = 2, tickMs = 14, linePauseMs = 130, timers = window } = options;
  const lines = [...root.querySelectorAll<HTMLElement>('[data-type]')].map((line) => {
    const full = line.textContent ?? '';
    const typed = document.createElement('span');
    const rest = document.createElement('span');
    rest.className = 'type-rest';
    rest.textContent = full;
    line.replaceChildren(typed, rest);
    const tag = line.parentElement?.querySelector<HTMLElement>('[data-type-tag]') ?? null;
    tag?.classList.add('type-pending');
    return { full, typed, rest, tag };
  });
  return new Promise((resolve) => {
    const typeLine = (index: number, count: number): void => {
      const line = lines[index];
      if (!line) {
        resolve();
        return;
      }
      line.typed.textContent = line.full.slice(0, count);
      line.rest.textContent = line.full.slice(count);
      if (count < line.full.length) {
        timers.setTimeout(() => typeLine(index, count + charsPerTick), tickMs);
        return;
      }
      line.rest.remove();
      line.tag?.classList.remove('type-pending');
      timers.setTimeout(() => typeLine(index + 1, 0), linePauseMs);
    };
    typeLine(0, 0);
  });
}
