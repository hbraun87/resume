// The loading HUD (docs/brief/10-loading-screen-spec.md, "Interaction logic"):
// scroll position is load progress, the section in view names the load stage,
// and reaching the bottom completes the load once and for good.

/** Not exactly 1: sub-pixel rounding and mobile address bars can stop a pixel short. */
export const COMPLETE_AT = 0.995;

export function scrollProgress(scrollY: number, scrollHeight: number, viewport: number): number {
  const max = Math.max(1, scrollHeight - viewport);
  return Math.min(1, Math.max(0, scrollY / max));
}

/** Eases the shown value toward the real one (0.18 per frame); reduced motion jumps. */
export function easeToward(shown: number, target: number, reduceMotion: boolean): number {
  if (reduceMotion) return target;
  const next = shown + (target - shown) * 0.18;
  return Math.abs(target - next) < 0.001 ? target : next;
}

/** The last section whose top is above the line (45% down the viewport), else the first. */
export function currentOf<T>(tops: { section: T; top: number }[], line: number, first: T): T {
  let current = first;
  for (const { section, top } of tops) if (top <= line) current = section;
  return current;
}

export interface StageInfo {
  stage: string;
  total?: number | undefined;
}

/** "Streaming levels (4/21)" for counted stages, the stage name otherwise. */
export function stageLabel(info: StageInfo, streamed: number, done: boolean): string {
  if (done) return 'Load complete';
  return info.total
    ? `${info.stage} (${Math.min(streamed, info.total)}/${info.total})`
    : info.stage;
}

/** File-like asset name from the first words: "Until You Fall" → "until_you_fall". */
export function assetName(text: string, maxWords = 3): string {
  const words = text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  return words.slice(0, maxWords).join('_') || 'asset';
}

export type AssetKind = 'level' | 'shader' | 'stage';

/** One asset-stream line; levels get a made-up size between 1.0 and 9.9 MB. */
export function assetLine(kind: AssetKind, name: string, random: () => number): string {
  if (kind === 'level') return `levels/${name}.lvl ${(1 + random() * 8.9).toFixed(1)}MB`;
  if (kind === 'shader') return `shaders/${name}.glsl OK`;
  return `stage/${name}.bundle LOADED`;
}

/** Keeps the newest lines (6 by default), oldest first. */
export function pushLine(lines: string[], line: string, keep = 6): string[] {
  return [...lines, line].slice(-keep);
}

/** The next tip index, wrapping around. */
export function nextTip(index: number, count: number): number {
  return count > 0 ? (index + 1) % count : 0;
}
