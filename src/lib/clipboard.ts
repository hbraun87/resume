// Copy the email address, falling back to selecting it for a manual copy.

/** Selects the text of a node so the visitor can copy it themselves. */
export function selectText(node: Node, selection: Selection | null = getSelection()): void {
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
}

/** "copied" when the clipboard took the text, "selected" when the visitor has to copy it. */
export async function copyText(
  text: string,
  fallbackNode: Node,
  clipboard: Pick<Clipboard, 'writeText'> | null = navigator.clipboard,
): Promise<'copied' | 'selected'> {
  try {
    if (!clipboard) throw new Error('Clipboard unavailable');
    await clipboard.writeText(text);
    return 'copied';
  } catch {
    selectText(fallbackNode);
    return 'selected';
  }
}
