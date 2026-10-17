import { describe, expect, it } from 'vitest';
import { escapeHtml, inlineMarkdown, plainText } from '../../src/lib/text';

describe('inlineMarkdown', () => {
  it('renders emphasis, strong and code', () => {
    expect(inlineMarkdown('Shipped *I Expect You To Die* with **Unity** and `C#`')).toBe(
      'Shipped <em>I Expect You To Die</em> with <strong>Unity</strong> and <code>C#</code>',
    );
  });

  it('escapes any markup in content', () => {
    expect(inlineMarkdown('<script>"x" & \'y\'</script>')).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;',
    );
    expect(escapeHtml('plain')).toBe('plain');
  });
});

describe('plainText', () => {
  it('drops the markers', () => {
    expect(plainText('*Toren* on **OnLive** with `Unity`')).toBe('Toren on OnLive with Unity');
  });
});
