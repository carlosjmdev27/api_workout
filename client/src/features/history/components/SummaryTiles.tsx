import type { JSX } from 'react';
import { formatDuration, formatWeight, signedDelta } from '../../../utils/format';
import type { TotalsComparison } from '../compare';

function Tile({ label, value, delta }: { label: string; value: string; delta?: string | null }): JSX.Element {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</dd>
      {delta && <dd className="mt-0.5 text-xs tabular-nums text-slate-500">{delta} vs anterior</dd>}
    </div>
  );
}

interface SummaryTilesProps {
  durationSeconds: number | null;
  totals: TotalsComparison;
}

/** Headline figures of a finished workout. */
export function SummaryTiles({ durationSeconds, totals }: SummaryTilesProps): JSX.Element {
  const { current, previous } = totals;
  const delta = (now: number, before: number | undefined, unit?: string): string | null =>
    before === undefined ? null : signedDelta(now - before, unit);

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile label="Duración" value={durationSeconds === null ? '—' : formatDuration(durationSeconds)} />
      <Tile label="Peso movido" value={formatWeight(current.volume)} delta={delta(current.volume, previous?.volume, 'kg')} />
      <Tile label="Series hechas" value={String(current.completedSets)} delta={delta(current.completedSets, previous?.completedSets)} />
      <Tile label="Reps totales" value={String(current.totalReps)} delta={delta(current.totalReps, previous?.totalReps)} />
    </dl>
  );
}
