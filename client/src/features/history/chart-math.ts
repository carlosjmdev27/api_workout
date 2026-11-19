/** Round, human-friendly axis ticks (steps of 1, 2, 2.5 or 5 × 10^n). */
export function niceTicks(min: number, max: number, count = 4): number[] {
  const low = min === max ? min - Math.max(1, Math.abs(min) * 0.05) : min;
  const high = min === max ? max + Math.max(1, Math.abs(max) * 0.05) : max;
  const raw = (high - low) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? 10 * magnitude;

  const ticks: number[] = [];
  for (let tick = Math.floor(low / step) * step; tick <= Math.ceil(high / step) * step + step / 2; tick += step) {
    ticks.push(Math.round(tick * 1e6) / 1e6);
  }
  return ticks;
}

export type Scale = (value: number) => number;

export function linearScale(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  return (value) => (d0 === d1 ? (r0 + r1) / 2 : r0 + ((value - d0) / (d1 - d0)) * (r1 - r0));
}

/** Index of the x position closest to `x` (crosshair snapping). */
export function nearestIndex(xs: number[], x: number): number {
  return xs.reduce((best, current, index) => (Math.abs(current - x) < Math.abs((xs[best] ?? 0) - x) ? index : best), 0);
}
