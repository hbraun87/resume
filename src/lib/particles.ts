// The finale's particle system, free of the DOM so it can be tested directly
// (docs/brief/10-loading-screen-spec.md, "Finale particle effect"). A bar of
// particles fills with the load, bursts at 100% and springs into the headline.

export type Phase = 'bar' | 'burst' | 'form';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Home slot in the loading bar. */
  bx: number;
  by: number;
  /** Target in the headline. */
  tx: number;
  ty: number;
  /** Drawn in the accent color once formed (about 28% of particles). */
  warm: boolean;
}

export interface Pointer {
  x: number;
  y: number;
}

export const BURST_MS = 420;
const REPEL_RADIUS = 90;
const REPEL_FORCE = 6;

/** Splits words into `count` lines, keeping the longest line as short as possible. */
export function balanceLines(words: string[], count: number): string[] {
  const lines = Math.max(1, Math.min(count, words.length));
  const width = (from: number, to: number) => words.slice(from, to).join(' ').length;
  const best = (from: number, left: number): { cost: number; breaks: number[] } => {
    if (left === 1) return { cost: width(from, words.length), breaks: [] };
    let result = { cost: Infinity, breaks: [] as number[] };
    for (let end = from + 1; end <= words.length - left + 1; end += 1) {
      const rest = best(end, left - 1);
      const cost = Math.max(width(from, end), rest.cost);
      if (cost < result.cost) result = { cost, breaks: [end, ...rest.breaks] };
    }
    return result;
  };
  const { breaks } = best(0, lines);
  return [0, ...breaks].map((start, i) => words.slice(start, breaks[i] ?? words.length).join(' '));
}

/** Headline lines for a stage width: two lines, or four on narrow stages. */
export function headlineLines(text: string, stageWidth: number): string[] {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  return balanceLines(words, stageWidth < 560 ? 4 : 2);
}

/**
 * Sampling grid step: about 2,500–3,500 particles at any stage size. Denser than
 * the spec's ~1,500 so the headline stays legible on phones (docs/decisions.md).
 */
export function particleStep(width: number, height: number): number {
  return Math.max(3, Math.round(Math.sqrt((width * height) / 12000)));
}

/** Font size that fits the lines in 86% of the width and 74% of the height. */
export function fitFontSize(
  widestAt100: number,
  lineCount: number,
  width: number,
  height: number,
  lineHeight = 1,
): number {
  const byWidth = widestAt100 > 0 ? (100 * width * 0.86) / widestAt100 : Infinity;
  const byHeight = (height * 0.74) / (lineCount * lineHeight);
  return Math.max(8, Math.floor(Math.min(byWidth, byHeight)));
}

/** Grid points where the drawn text is opaque, left to right. */
export function samplePoints(
  rgba: ArrayLike<number>,
  width: number,
  height: number,
  step: number,
): [number, number][] {
  const points: [number, number][] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if ((rgba[(y * width + x) * 4 + 3] ?? 0) > 128) points.push([x, y]);
    }
  }
  // Left to right, so the bar's left end becomes the text's left side.
  return points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

/** Slot `i` of a bar 78% of the stage wide (at most 760px), centered, filled column by column. */
export function barLayout(
  count: number,
  width: number,
  height: number,
): (index: number) => [number, number] {
  const barWidth = Math.min(760, width * 0.78);
  const rows = Math.max(1, Math.round(Math.sqrt((count * 22) / Math.max(1, barWidth))));
  const gapX = barWidth / Math.max(1, Math.ceil(count / rows));
  const gapY = 22 / rows;
  const left = (width - barWidth) / 2;
  const top = height / 2 - 11;
  return (index) => [left + Math.floor(index / rows) * gapX, top + (index % rows) * gapY];
}

/** Particles for a set of targets, sitting in their bar slots. */
export function createParticles(
  targets: [number, number][],
  width: number,
  height: number,
  random: () => number,
): Particle[] {
  const slot = barLayout(targets.length, width, height);
  return targets.map(([tx, ty], i) => {
    const [bx, by] = slot(i);
    return { x: bx, y: by, vx: 0, vy: 0, bx, by, tx, ty, warm: random() < 0.28 };
  });
}

/** Moves new targets onto existing particles, keeping their colors; extras are created. */
export function retarget(
  particles: Particle[],
  targets: [number, number][],
  width: number,
  height: number,
  random: () => number,
  snap: boolean,
): Particle[] {
  const fresh = createParticles(targets, width, height, random);
  return fresh.map((particle, i) => {
    const old = particles[i];
    const next = old
      ? { ...old, bx: particle.bx, by: particle.by, tx: particle.tx, ty: particle.ty }
      : particle;
    if (snap) Object.assign(next, { x: next.tx, y: next.ty, vx: 0, vy: 0 });
    return next;
  });
}

/** Launches every particle in a random direction, slightly upward. */
export function burst(particles: Particle[], random: () => number): void {
  for (const p of particles) {
    const angle = random() * Math.PI * 2;
    const speed = 6 + random() * 16;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 4;
  }
}

/** Puts every particle on its headline target. */
export function snapToText(particles: Particle[]): void {
  for (const p of particles) Object.assign(p, { x: p.tx, y: p.ty, vx: 0, vy: 0 });
}

/** One animation frame for every particle. `time` is in milliseconds. */
export function stepParticles(
  particles: Particle[],
  phase: Phase,
  time: number,
  pointer: Pointer | null,
): void {
  particles.forEach((p, i) => {
    if (phase === 'bar') {
      p.x = p.bx + Math.sin(time * 0.003 + i) * 0.6;
      p.y = p.by + Math.cos(time * 0.0027 + i * 1.3) * 0.6;
      return;
    }
    if (phase === 'burst') {
      p.vx *= 0.9;
      p.vy = p.vy * 0.9 + 0.25;
    } else {
      p.vx = (p.vx + (p.tx - p.x) * 0.06) * 0.82;
      p.vy = (p.vy + (p.ty - p.y) * 0.06) * 0.82;
      if (pointer) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < REPEL_RADIUS) {
          const force = ((REPEL_RADIUS - distance) / REPEL_RADIUS) * REPEL_FORCE;
          p.vx += (dx / distance) * force;
          p.vy += (dy / distance) * force;
        }
      }
    }
    p.x += p.vx;
    p.y += p.vy;
  });
}

export interface Ring {
  radius: number;
  alpha: number;
}

/** Grows the shockwave ring; returns null once it has faded out. */
export function stepRing(ring: Ring, width: number, height: number): Ring | null {
  const next = { radius: ring.radius + Math.max(width, height) * 0.035, alpha: ring.alpha * 0.93 };
  return next.alpha < 0.02 ? null : next;
}

/** Party mode: a rainbow that sweeps across the stage. */
export function partyColor(x: number, width: number, time: number): string {
  const hue = ((x / Math.max(1, width)) * 360 + (time / 1000) * 120) % 360;
  return `hsl(${Math.round(hue)} 85% 62%)`;
}
