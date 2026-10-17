import { describe, expect, it } from 'vitest';
import {
  balanceLines,
  barLayout,
  burst,
  createParticles,
  fitFontSize,
  headlineLines,
  particleStep,
  partyColor,
  retarget,
  samplePoints,
  snapToText,
  stepParticles,
  stepRing,
  type Particle,
} from '../../src/lib/particles';

const words = "LET'S BUILD THE NEXT ONE.".split(' ');

describe('balanceLines', () => {
  it('splits into two or four lines, keeping the longest short', () => {
    expect(balanceLines(words, 2)).toEqual(["LET'S BUILD", 'THE NEXT ONE.']);
    expect(balanceLines(words, 4)).toEqual(["LET'S", 'BUILD', 'THE NEXT', 'ONE.']);
  });
  it('never makes more lines than words, or fewer than one', () => {
    expect(balanceLines(['HI', 'THERE'], 4)).toEqual(['HI', 'THERE']);
    expect(balanceLines(['HI'], 0)).toEqual(['HI']);
  });
});

describe('headlineLines', () => {
  it('uses four lines on narrow stages', () => {
    expect(headlineLines("Let's build the next one.", 900)).toHaveLength(2);
    expect(headlineLines("Let's build  the next one.", 400)).toEqual([
      "LET'S",
      'BUILD',
      'THE NEXT',
      'ONE.',
    ]);
  });
});

describe('particleStep', () => {
  it('scales with the stage and never drops below 3px', () => {
    expect(particleStep(300, 300)).toBe(3);
    expect(particleStep(1290, 484)).toBe(7);
  });
});

describe('fitFontSize', () => {
  it('fits the width or the height, whichever is tighter', () => {
    expect(fitFontSize(1000, 2, 1000, 1000)).toBe(86);
    expect(fitFontSize(100, 2, 1000, 100)).toBe(37);
    expect(fitFontSize(100, 4, 1000, 400, 0.95)).toBe(77);
  });
  it('handles text that measures zero and tiny stages', () => {
    expect(fitFontSize(0, 1, 100, 100)).toBe(74);
    expect(fitFontSize(1000, 4, 10, 10)).toBe(8);
  });
});

describe('samplePoints', () => {
  it('keeps opaque grid points, left to right', () => {
    const width = 4;
    const height = 2;
    const rgba = new Uint8ClampedArray(width * height * 4);
    const opaque = (x: number, y: number) => (rgba[(y * width + x) * 4 + 3] = 255);
    opaque(2, 0);
    opaque(0, 1);
    opaque(2, 1);
    opaque(1, 1); // off the 2px grid
    expect(samplePoints(rgba, width, height, 1)).toEqual([
      [0, 1],
      [1, 1],
      [2, 0],
      [2, 1],
    ]);
    expect(samplePoints(rgba, width, height, 2)).toEqual([[2, 0]]);
  });
  it('treats missing data as transparent', () => {
    expect(samplePoints([0, 0, 0, 255], 2, 1, 1)).toEqual([[0, 0]]);
  });
});

describe('barLayout', () => {
  it('centers a bar 78% wide, at most 760px, filling columns first', () => {
    const slot = barLayout(100, 1000, 400);
    const [x0, y0] = slot(0);
    expect(x0).toBe(120);
    expect(y0).toBe(189);
    const rows = 2;
    expect(slot(1)[0]).toBe(x0);
    expect(slot(rows)[0]).toBeGreaterThan(x0);
    expect(slot(99)[0]).toBeLessThan(120 + 760);
  });
  it('copes with a single particle on a tiny stage', () => {
    const [x, y] = barLayout(1, 1, 10)(0);
    expect(x).toBeCloseTo(0.11);
    expect(y).toBe(-6);
  });
});

const targets: [number, number][] = [
  [10, 10],
  [20, 10],
  [30, 10],
];
const half = () => 0.5;

describe('createParticles', () => {
  it('starts each particle at rest in its bar slot', () => {
    const [p] = createParticles(targets, 400, 200, () => 0.1);
    expect(p).toMatchObject({ vx: 0, vy: 0, tx: 10, ty: 10, warm: true });
    expect([p?.x, p?.y]).toEqual([p?.bx, p?.by]);
  });
});

describe('retarget', () => {
  it('keeps existing particles and colors, adds extras, and snaps when formed', () => {
    const before = createParticles(targets.slice(0, 2), 400, 200, () => 0.9);
    const after = retarget(before, targets, 800, 300, () => 0.1, true);
    expect(after).toHaveLength(3);
    expect(after[0]?.warm).toBe(false);
    expect(after[2]?.warm).toBe(true);
    expect(after.map((p) => [p.x, p.y])).toEqual(targets);
  });
  it('leaves positions alone before the finale forms', () => {
    const before = createParticles(targets, 400, 200, half);
    const after = retarget(before, targets.slice(0, 1), 800, 300, half, false);
    expect(after).toHaveLength(1);
    expect(after[0]?.x).toBe(before[0]?.x);
  });
});

describe('burst and snapToText', () => {
  it('launches particles upward-biased, then snaps them home', () => {
    const particles = createParticles(targets, 400, 200, half);
    burst(particles, () => 0.75);
    expect(particles[0]?.vy).toBeLessThan(-4);
    snapToText(particles);
    expect(particles.map((p) => [p.x, p.y, p.vx, p.vy])).toEqual(
      targets.map(([x, y]) => [x, y, 0, 0]),
    );
  });
});

describe('stepParticles', () => {
  const one = (): Particle => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    bx: 5,
    by: 5,
    tx: 100,
    ty: 0,
    warm: false,
  });

  it('jitters around the bar slot', () => {
    const p = one();
    stepParticles([p], 'bar', 1000, null);
    expect(Math.abs(p.x - 5)).toBeLessThanOrEqual(0.6);
    expect(Math.abs(p.y - 5)).toBeLessThanOrEqual(0.6);
  });

  it('slows and falls during the burst', () => {
    const p = { ...one(), vx: 10, vy: 0 };
    stepParticles([p], 'burst', 0, null);
    expect(p.vx).toBeCloseTo(9);
    expect(p.vy).toBeCloseTo(0.25);
  });

  it('springs toward the target when formed', () => {
    const p = one();
    stepParticles([p], 'form', 0, null);
    expect(p.x).toBeGreaterThan(0);
    expect(p.y).toBe(0);
  });

  it('is pushed away by a nearby pointer, and only a nearby one', () => {
    const near = { ...one(), x: 100, tx: 100 };
    stepParticles([near], 'form', 0, { x: 90, y: 0 });
    expect(near.x).toBeGreaterThan(100);
    const far = { ...one(), x: 100, tx: 100 };
    stepParticles([far], 'form', 0, { x: 0, y: 0 });
    expect(far.x).toBe(100);
    const under = { ...one(), x: 100, tx: 100 };
    stepParticles([under], 'form', 0, { x: 100, y: 0 });
    expect(under.x).toBe(100);
  });
});

describe('stepRing', () => {
  it('grows and fades, then disappears', () => {
    expect(stepRing({ radius: 0, alpha: 1 }, 1000, 500)).toEqual({ radius: 35, alpha: 0.93 });
    expect(stepRing({ radius: 0, alpha: 0.02 }, 1000, 500)).toBeNull();
  });
});

describe('partyColor', () => {
  it('sweeps hue across the stage and over time', () => {
    expect(partyColor(0, 100, 0)).toBe('hsl(0 85% 62%)');
    expect(partyColor(50, 100, 0)).toBe('hsl(180 85% 62%)');
    expect(partyColor(0, 0, 1000)).toBe('hsl(120 85% 62%)');
  });
});
