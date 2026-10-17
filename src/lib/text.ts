// Inline Markdown for content strings: *emphasis*, **strong** and `code`.
// Everything else is escaped, so content can never inject markup.

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function inlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** The text without Markdown markers, for meta descriptions and alt-like uses. */
export function plainText(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g, '$1$2$3');
}
