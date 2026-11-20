import { useState, type JSX, type KeyboardEvent, type PointerEvent } from 'react';
import { useElementWidth } from '../../../hooks/useElementWidth';
import { formatNumber, formatShortDate } from '../../../utils/format';
import { linearScale, nearestIndex, niceTicks } from '../chart-math';

export interface ChartPoint {
  id: string;
  date: string; // ISO
  value: number;
  detail: string; // Secondary tooltip line, e.g. "100 kg × 7"
}

interface ProgressChartProps {
  points: ChartPoint[];
  /** Accessible name; the visible title is rendered by the parent. */
  label: string;
  unit: string;
}

const HEIGHT = 220;
const M = { top: 20, right: 64, bottom: 28, left: 44 };

/** Single-series line chart: max weight (or any metric) over time, with crosshair + keyboard. */
export function ProgressChart({ points, label, unit }: ProgressChartProps): JSX.Element {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const times = points.map((p) => Date.parse(p.date));
  const values = points.map((p) => p.value);
  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const x = linearScale([Math.min(...times), Math.max(...times)], [M.left, Math.max(M.left, width - M.right)]);
  const y = linearScale([ticks[0] ?? 0, ticks.at(-1) ?? 1], [HEIGHT - M.bottom, M.top]);
  const xs = times.map(x);
  const ys = values.map(y);
  const path = xs.map((px, i) => `${i === 0 ? 'M' : 'L'}${px},${ys[i]}`).join(' ');
  const last = points.length - 1;
  const current = active === null ? null : points[active];

  const handlePointer = (event: PointerEvent<SVGSVGElement>): void => {
    const box = event.currentTarget.getBoundingClientRect();
    setActive(nearestIndex(xs, event.clientX - box.left));
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>): void => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (event.key === 'Escape') setActive(null);
    if (step === 0) return;
    event.preventDefault();
    setActive((prev) => Math.min(last, Math.max(0, (prev ?? last) + step)));
  };

  return (
    <div
      ref={ref}
      role="group"
      tabIndex={0}
      aria-label={`${label}. Usa las flechas para recorrer las sesiones.`}
      onKeyDown={handleKey}
      onFocus={() => setActive((prev) => prev ?? last)}
      onBlur={() => setActive(null)}
      className="relative rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
    >
      {width > 0 && (
        <svg width={width} height={HEIGHT} aria-hidden="true" onPointerMove={handlePointer} onPointerLeave={() => setActive(null)} className="block touch-none">
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={M.left} x2={width - M.right + 16} y1={y(tick)} y2={y(tick)} className="stroke-slate-200" strokeWidth={1} />
              <text x={M.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-slate-500 text-[11px] tabular-nums">{formatNumber(tick)}</text>
            </g>
          ))}
          {points.length > 0 && (
            <>
              <text x={xs[0]} y={HEIGHT - 8} textAnchor={points.length === 1 ? 'middle' : 'start'} className="fill-slate-500 text-[11px]">{formatShortDate(points[0]?.date ?? '')}</text>
              {points.length > 1 && <text x={xs[last]} y={HEIGHT - 8} textAnchor="end" className="fill-slate-500 text-[11px]">{formatShortDate(points[last]?.date ?? '')}</text>}
            </>
          )}
          {active !== null && <line x1={xs[active]} x2={xs[active]} y1={M.top - 8} y2={HEIGHT - M.bottom} className="stroke-slate-400" strokeWidth={1} />}
          {points.length > 1 && <path d={path} fill="none" className="stroke-indigo-600" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
          {xs.map((px, i) => (
            <circle key={points[i]?.id} cx={px} cy={ys[i]} r={active === i ? 6 : 4} className="fill-indigo-600 stroke-white" strokeWidth={2} />
          ))}
          <text x={(xs[last] ?? 0) + 10} y={ys[last]} dy="0.32em" className="fill-slate-700 text-xs font-semibold tabular-nums">{`${formatNumber(values[last] ?? 0)} ${unit}`}</text>
        </svg>
      )}

      {current && active !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={{ left: Math.min(Math.max(xs[active] ?? 0, 70), width - 70), top: (ys[active] ?? 0) - 12 }}
        >
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-3 rounded bg-indigo-600" aria-hidden="true" />
            <strong className="text-sm tabular-nums text-slate-900">{formatNumber(current.value)} {unit}</strong>
          </div>
          <div className="mt-0.5 whitespace-nowrap text-slate-500">{formatShortDate(current.date)} · {current.detail}</div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {current ? `${formatShortDate(current.date)}: ${formatNumber(current.value)} ${unit}, ${current.detail}` : ''}
      </p>
    </div>
  );
}
