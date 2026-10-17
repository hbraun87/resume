// Achievement-style toasts in one polite live region.

export interface ToastContent {
  kicker: string;
  title: string;
  detail?: string | undefined;
}

/** Shows a toast for `duration` ms; a new toast replaces the one on screen. */
export function showToast(
  region: HTMLElement,
  content: ToastContent,
  duration = 4200,
  timers: Pick<Window, 'setTimeout'> = window,
): HTMLElement {
  const toast = document.createElement('div');
  toast.className = 'toast';
  for (const [className, text] of [
    ['toast-kicker mono', content.kicker],
    ['toast-title', content.title],
    ['toast-detail', content.detail],
  ] as const) {
    if (!text) continue;
    const line = document.createElement('p');
    line.className = className;
    line.textContent = text;
    toast.append(line);
  }
  region.replaceChildren(toast);
  timers.setTimeout(() => toast.remove(), duration);
  return toast;
}
