// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { Finale } from '../../src/lib/finale';
import { BURST_MS } from '../../src/lib/particles';
import { fakeContext } from '../fake-context';

const colors = () => ({ accent: 'orange', text: 'bone', muted: 'grey' });

function makeFinale(options: { reduceMotion?: boolean; random?: () => number } = {}) {
  const canvas = { width: 0, height: 0 };
  const main = fakeContext();
  const scratch = fakeContext();
  const finale = new Finale(canvas, main.context, {
    text: "Let's build the next one.",
    font: 'Unbounded',
    reduceMotion: options.reduceMotion ?? false,
    colors,
    scratch: () => scratch.context,
    ...(options.random ? { random: options.random } : {}),
  });
  return { finale, canvas, main, scratch };
}

describe('Finale', () => {
  it('sizes the canvas with the pixel ratio capped at 2 and samples the headline', () => {
    const { finale, canvas, main, scratch } = makeFinale();
    finale.resize(800, 400, 3);
    expect([canvas.width, canvas.height]).toEqual([1600, 800]);
    expect(main.calls).toContain('setTransform 2,0,0,2,0,0');
    expect(scratch.calls).toContain("fillText LET'S BUILD");
    expect(scratch.calls).toContain('fillText THE NEXT ONE.');
    expect(finale.particles.length).toBeGreaterThan(100);
    finale.resize(400, 300, 0.5);
    expect(canvas.width).toBe(400);
    expect(scratch.calls).toContain('fillText THE NEXT');
  });

  it('draws the bar lit up to the progress, the rest dimmed', () => {
    const { finale, main } = makeFinale({ random: () => 0.5 });
    finale.resize(800, 400, 1);
    finale.progress = 0.25;
    main.fills.length = 0;
    finale.frame(16);
    const lit = main.fills.filter((fill) => fill === 'orange').length;
    expect(lit).toBe(Math.round(finale.particles.length * 0.25));
    expect(main.fills.filter((fill) => fill === 'grey')).toHaveLength(
      finale.particles.length - lit,
    );
  });

  it('bursts with a ring, then forms the text in bone and accent', () => {
    let n = 0;
    const { finale, main } = makeFinale({ random: () => (n += 0.37) % 1 });
    finale.resize(800, 400, 1);
    finale.explode(1000);
    expect(finale.phase).toBe('burst');
    finale.frame(1000 + 16);
    expect(main.calls).toContain('arc');
    expect(finale.phase).toBe('burst');
    finale.frame(1000 + BURST_MS);
    expect(finale.phase).toBe('form');
    main.fills.length = 0;
    for (let t = 0; t < 200; t += 1) finale.frame(2000 + t * 16);
    expect(finale.ring).toBeNull();
    expect(new Set(main.fills)).toEqual(new Set(['orange', 'bone']));
    const p = finale.particles[0];
    expect(Math.abs((p?.x ?? 0) - (p?.tx ?? 0))).toBeLessThan(1);
  });

  it('snaps straight to the text under reduced motion, also after a resize', () => {
    const { finale } = makeFinale({ reduceMotion: true });
    finale.resize(800, 400, 1);
    finale.explode(0);
    expect(finale.phase).toBe('form');
    expect(finale.ring).toBeNull();
    finale.resize(600, 400, 1);
    expect(finale.particles.every((p) => p.x === p.tx && p.y === p.ty)).toBe(true);
  });

  it('keeps formed particles in place on resize with motion allowed', () => {
    const { finale } = makeFinale();
    finale.resize(800, 400, 1);
    finale.explode(0);
    finale.frame(BURST_MS);
    finale.resize(700, 400, 1);
    expect(finale.particles.every((p) => p.x === p.tx)).toBe(true);
  });

  it('colors every particle by position in party mode', () => {
    const { finale, main } = makeFinale();
    finale.resize(800, 400, 1);
    finale.party = true;
    finale.explode(0);
    main.fills.length = 0;
    finale.draw(0);
    expect(main.fills.every((fill) => fill.startsWith('hsl('))).toBe(true);
  });

  it('uses Math.random by default', () => {
    const { finale } = makeFinale();
    finale.resize(800, 400, 1);
    expect(finale.particles.some((p) => p.warm) || finale.particles.some((p) => !p.warm)).toBe(
      true,
    );
  });
});
