// ↑ ↑ ↓ ↓ ← → ← → B A toggles party mode on the finale.

export const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

/** A keydown handler that calls onMatch each time the full sequence is typed. */
export function konamiListener(onMatch: () => void): (event: KeyboardEvent) => void {
  let position = 0;
  return (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === KONAMI[position]) {
      position += 1;
      if (position === KONAMI.length) {
        position = 0;
        onMatch();
      }
    } else if (key === KONAMI[0]) {
      // A third ↑ still leaves the last two ↑ as a valid start.
      position = position === 2 ? 2 : 1;
    } else {
      position = 0;
    }
  };
}
