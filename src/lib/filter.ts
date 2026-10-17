// Platform filter for the level select. Without JavaScript every card shows.

/** Shows the cards in `group` (or all), returns how many are visible. */
export function applyFilter(cards: HTMLElement[], group: string): number {
  let shown = 0;
  for (const card of cards) {
    const visible = group === 'all' || card.dataset['platform'] === group;
    card.hidden = !visible;
    if (visible) shown += 1;
  }
  return shown;
}

/**
 * Wires the `[data-filter]` buttons in a group to the cards, announces the
 * result in `status`, and calls onChange after each change (page height moved).
 */
export function enhanceFilters(
  group: HTMLElement,
  cards: HTMLElement[],
  status: HTMLElement | null,
  onChange: () => void = () => {},
): void {
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  group.hidden = false;
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const value = button.dataset['filter'] || 'all';
      for (const other of buttons) other.setAttribute('aria-pressed', String(other === button));
      const shown = applyFilter(cards, value);
      if (status) {
        const label = button.dataset['label'] ?? '';
        status.textContent = `Showing ${shown} ${value === 'all' ? '' : `${label} `}title${shown === 1 ? '' : 's'}`;
      }
      onChange();
    });
  }
}
