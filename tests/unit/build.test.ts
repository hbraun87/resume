import { afterEach, describe, expect, it, vi } from 'vitest';

const execSync = vi.hoisted(() => vi.fn());
vi.mock('node:child_process', () => ({ execSync }));

const { buildInfo } = await import('../../src/lib/build');

afterEach(() => {
  vi.unstubAllEnvs();
  execSync.mockReset();
});

describe('buildInfo', () => {
  it('uses GITHUB_SHA in CI', () => {
    vi.stubEnv('GITHUB_SHA', 'abcdef1234567890');
    expect(buildInfo()).toMatchObject({ sha: 'abcdef1234567890', shortSha: 'abcdef1' });
    expect(execSync).not.toHaveBeenCalled();
  });

  it('falls back to git locally', () => {
    vi.stubEnv('GITHUB_SHA', undefined);
    execSync.mockReturnValue(Buffer.from('1234567abcdef\n'));
    expect(buildInfo()).toMatchObject({ sha: '1234567abcdef', shortSha: '1234567' });
  });

  it('returns an empty sha when git is unavailable', () => {
    vi.stubEnv('GITHUB_SHA', '');
    execSync.mockImplementation(() => {
      throw new Error('not a git repository');
    });
    expect(buildInfo()).toMatchObject({ sha: '', shortSha: '' });
  });

  it('stamps the build date as YYYY-MM-DD', () => {
    vi.stubEnv('GITHUB_SHA', 'abc');
    expect(buildInfo().date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
