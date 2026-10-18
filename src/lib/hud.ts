// The loading HUD (docs/brief/10-loading-screen-spec.md, "Interaction logic"):
// scroll position is load progress, the section in view names the load stage,
// and reaching the bottom completes the load once and for good.

/** Not exactly 1: sub-pixel rounding and mobile address bars can stop a pixel short. */
export const COMPLETE_AT = 0.995;

/** Share of the finale that must be on screen before the load completes. */
export const FINALE_IN_VIEW = 0.75;

/**
 * True once `share` of a box (its top relative to the viewport, and its height)
 * has scrolled into view; a box taller than the screen counts once it fills it.
 * Empty boxes (hidden, or not laid out) never count.
 */
export function revealed(
  top: number,
  height: number,
  viewport: number,
  share = FINALE_IN_VIEW,
): boolean {
  return height > 0 && top + Math.min(height * share, viewport) <= viewport;
}

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

/** The next tip index, wrapping around. */
export function nextTip(index: number, count: number): number {
  return count > 0 ? (index + 1) % count : 0;
}
