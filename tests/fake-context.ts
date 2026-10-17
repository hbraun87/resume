import type { Context2D } from '../src/lib/finale';

/** A recording 2D context; getImageData returns a solid block in the middle. */
export function fakeContext(opaque = true) {
  const calls: string[] = [];
  const fills: string[] = [];
  const context = {
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
    lineWidth: 1,
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    arc: () => calls.push('arc'),
    beginPath: () => calls.push('beginPath'),
    clearRect: () => calls.push('clearRect'),
    fillRect() {
      fills.push(String(this.fillStyle));
    },
    fillText: (text: string) => calls.push(`fillText ${text}`),
    measureText: (text: string) => ({ width: text.length * 60 }),
    setTransform: (...args: number[]) => calls.push(`setTransform ${args.join(',')}`),
    stroke: () => calls.push('stroke'),
    getImageData: (_x: number, _y: number, width: number, height: number) => {
      const data = new Uint8ClampedArray(width * height * 4);
      if (opaque) {
        for (let y = Math.floor(height / 3); y < (2 * height) / 3; y += 1) {
          for (let x = Math.floor(width / 4); x < (3 * width) / 4; x += 1)
            data[(y * width + x) * 4 + 3] = 255;
        }
      }
      return { data, width, height };
    },
  };
  return { context: context as unknown as Context2D, calls, fills };
}
