import { describe, expect, it } from 'vitest';
import { url } from '../../src/lib/url';

describe('url()', () => {
  it('returns the root for the domain root base', () => {
    expect(url('/', '/')).toBe('/');
  });

  it('prefixes the repository base path', () => {
    expect(url('/work/until-you-fall/', '/resume/')).toBe('/resume/work/until-you-fall/');
  });

  it('accepts a base without a trailing slash', () => {
    expect(url('/about', '/resume')).toBe('/resume/about/');
  });

  it('adds a trailing slash to directory routes only', () => {
    expect(url('about', '/')).toBe('/about/');
    expect(url('/resume/henry-braun.pdf', '/')).toBe('/resume/henry-braun.pdf');
  });

  it('keeps query strings and hashes after the slash', () => {
    expect(url('/work?platform=vr', '/resume/')).toBe('/resume/work/?platform=vr');
    expect(url('/#contact', '/')).toBe('/#contact');
  });

  it('rejects external URLs', () => {
    expect(() => url('https://example.com', '/')).toThrow(/internal paths only/);
    expect(() => url('mailto:someone@example.com', '/')).toThrow(/internal paths only/);
  });
});
