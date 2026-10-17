import { execSync } from 'node:child_process';

/** Commit and date of the current build, shown in the footer. */
export function buildInfo(): { sha: string; shortSha: string; date: string } {
  let sha = process.env['GITHUB_SHA'] ?? '';
  if (!sha) {
    try {
      sha = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();
    } catch {
      sha = '';
    }
  }
  return { sha, shortSha: sha.slice(0, 7), date: new Date().toISOString().slice(0, 10) };
}
