import { describe, expect, it } from 'vitest';
import {
  COMPLETE_AT,
  currentOf,
  easeToward,
  nextTip,
  revealed,
  scrollProgress,
  stageLabel,
} from '../../src/lib/hud';

describe('revealed', () => {
  it('counts a box once three quarters of it are on screen', () => {
    expect(revealed(800, 400, 1000)).toBe(false);
    expect(revealed(700, 400, 1000)).toBe(true);
    expect(revealed(-100, 400, 1000)).toBe(true);
    expect(revealed(500, 400, 1000, 1)).toBe(true);
  });
  it('counts a box taller than the screen once it fills it', () => {
    expect(revealed(10, 3000, 1000)).toBe(false);
    expect(revealed(0, 3000, 1000)).toBe(true);
  });
  it('never counts an empty box', () => {
    expect(revealed(0, 0, 1000)).toBe(false);
  });
});

describe('scrollProgress', () => {
  it('is the share of the scrollable height, clamped to 0–1', () => {
    expect(scrollProgress(0, 3000, 1000)).toBe(0);
    expect(scrollProgress(1000, 3000, 1000)).toBe(0.5);
    expect(scrollProgress(2500, 3000, 1000)).toBe(1);
    expect(scrollProgress(-40, 3000, 1000)).toBe(0);
  });

  it('never divides by zero on a page that does not scroll', () => {
    expect(scrollProgress(0, 500, 800)).toBe(0);
  });

  it('completes a pixel short of the bottom', () => {
    expect(scrollProgress(1999, 3000, 1000)).toBeGreaterThanOrEqual(COMPLETE_AT);
  });
});

describe('easeToward', () => {
  it('moves 18% of the way per frame', () => {
    expect(easeToward(0, 1, false)).toBeCloseTo(0.18);
  });
  it('lands on the target once close enough', () => {
    expect(easeToward(0.9995, 1, false)).toBe(1);
  });
  it('jumps straight there under reduced motion', () => {
    expect(easeToward(0, 0.7, true)).toBe(0.7);
  });
});

describe('currentOf', () => {
  const tops = [
    { section: 'boot', top: 0 },
    { section: 'profile', top: 900 },
    { section: 'games', top: 2000 },
  ];
  it('picks the last section whose top is above the line', () => {
    expect(currentOf(tops, 950, 'boot')).toBe('profile');
    expect(currentOf(tops, 5000, 'boot')).toBe('games');
  });
  it('falls back to the first section', () => {
    expect(currentOf(tops.slice(1), 10, 'boot')).toBe('boot');
  });
});

describe('stageLabel', () => {
  it('counts streamed levels, capped at the total', () => {
    expect(stageLabel({ stage: 'Streaming levels', total: 21 }, 4, false)).toBe(
      'Streaming levels (4/21)',
    );
    expect(stageLabel({ stage: 'Streaming levels', total: 2 }, 5, false)).toBe(
      'Streaming levels (2/2)',
    );
  });
  it('shows the stage name, or "Load complete" once done', () => {
    expect(stageLabel({ stage: 'Finalizing' }, 0, false)).toBe('Finalizing');
    expect(stageLabel({ stage: 'Finalizing' }, 0, true)).toBe('Load complete');
  });
});

describe('nextTip', () => {
  it('wraps around and copes with no tips', () => {
    expect(nextTip(0, 3)).toBe(1);
    expect(nextTip(2, 3)).toBe(0);
    expect(nextTip(0, 0)).toBe(0);
  });
});
