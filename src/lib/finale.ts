// Draws the finale stage: the particle loading bar, the burst, and the
// headline it forms. Canvas contexts are passed in, so tests can use a fake.
import {
  BURST_MS,
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
  type Phase,
  type Pointer,
  type Ring,
} from './particles';

/** The parts of CanvasRenderingContext2D the finale uses. */
export type Context2D = Pick<
  CanvasRenderingContext2D,
  | 'arc'
  | 'beginPath'
  | 'clearRect'
  | 'fillRect'
  | 'fillText'
  | 'getImageData'
  | 'measureText'
  | 'setTransform'
  | 'stroke'
  | 'fillStyle'
  | 'strokeStyle'
  | 'globalAlpha'
  | 'lineWidth'
  | 'font'
  | 'textAlign'
  | 'textBaseline'
>;

export interface FinaleColors {
  accent: string;
  text: string;
  muted: string;
}

export interface FinaleOptions {
  text: string;
  /** CSS font-family list for the display font. */
  font: string;
  reduceMotion: boolean;
  colors: () => FinaleColors;
  /** A scratch context of at least the given size, for sampling the text. */
  scratch: (width: number, height: number) => Context2D;
  random?: () => number;
}

const LINE_HEIGHT = 0.95;

export class Finale {
  phase: Phase = 'bar';
  progress = 0;
  party = false;
  pointer: Pointer | null = null;
  particles: Particle[] = [];
  ring: Ring | null = null;
  width = 0;
  height = 0;
  private burstAt = 0;
  private step = 3;
  private readonly random: () => number;

  constructor(
    private readonly canvas: { width: number; height: number },
    private readonly context: Context2D,
    private readonly options: FinaleOptions,
  ) {
    this.random = options.random ?? Math.random;
  }

  /** Sizes the canvas (device pixel ratio capped at 2) and rebuilds the text targets. */
  resize(width: number, height: number, devicePixelRatio: number): void {
    const ratio = Math.min(2, Math.max(1, devicePixelRatio));
    this.width = width;
    this.height = height;
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.step = particleStep(width, height);
    const targets = this.sampleText();
    this.particles =
      this.particles.length === 0
        ? createParticles(targets, width, height, this.random)
        : retarget(this.particles, targets, width, height, this.random, this.phase === 'form');
    if (this.phase === 'form' && this.options.reduceMotion) snapToText(this.particles);
  }

  /** Points on the headline, drawn in the display font on a scratch canvas. */
  sampleText(): [number, number][] {
    const { width, height } = this;
    const scratch = this.options.scratch(width, height);
    const lines = headlineLines(this.options.text, width);
    scratch.clearRect(0, 0, width, height);
    scratch.font = `900 100px ${this.options.font}`;
    const widest = Math.max(...lines.map((line) => scratch.measureText(line).width));
    const size = fitFontSize(widest, lines.length, width, height, LINE_HEIGHT);
    scratch.font = `900 ${size}px ${this.options.font}`;
    scratch.textAlign = 'center';
    scratch.textBaseline = 'middle';
    scratch.fillStyle = '#000';
    const first = height / 2 - ((lines.length - 1) * size * LINE_HEIGHT) / 2;
    lines.forEach((line, i) => scratch.fillText(line, width / 2, first + i * size * LINE_HEIGHT));
    const { data } = scratch.getImageData(0, 0, width, height);
    return samplePoints(data, width, height, this.step);
  }

  /** The load is complete: burst and form, or snap straight to the text under reduced motion. */
  explode(now: number): void {
    if (this.options.reduceMotion) {
      this.phase = 'form';
      snapToText(this.particles);
      return;
    }
    burst(this.particles, this.random);
    this.ring = { radius: 0, alpha: 1 };
    this.phase = 'burst';
    this.burstAt = now;
  }

  /** Advances one frame and draws it. */
  frame(now: number): void {
    if (this.phase === 'burst' && now - this.burstAt >= BURST_MS) this.phase = 'form';
    stepParticles(this.particles, this.phase, now, this.pointer);
    if (this.ring) this.ring = stepRing(this.ring, this.width, this.height);
    this.draw(now);
  }

  draw(now: number): void {
    const { context, particles, width, height } = this;
    const colors = this.options.colors();
    const size = Math.max(1.5, this.step * 0.62);
    context.clearRect(0, 0, width, height);
    const lit = Math.round(this.progress * particles.length);
    particles.forEach((p, i) => {
      if (this.phase === 'bar') {
        const on = i < lit;
        context.globalAlpha = on ? 1 : 0.16;
        context.fillStyle = on ? colors.accent : colors.muted;
      } else {
        context.globalAlpha = 1;
        context.fillStyle = this.party
          ? partyColor(p.x, width, now)
          : p.warm
            ? colors.accent
            : colors.text;
      }
      context.fillRect(p.x, p.y, size, size);
    });
    if (this.ring) {
      context.globalAlpha = this.ring.alpha;
      context.strokeStyle = colors.accent;
      context.lineWidth = 3;
      context.beginPath();
      context.arc(width / 2, height / 2, this.ring.radius, 0, Math.PI * 2);
      context.stroke();
    }
    context.globalAlpha = 1;
  }
}
