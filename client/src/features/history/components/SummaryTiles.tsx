import type { JSX } from 'react';
import { formatDuration, formatWeight, signedDelta } from '../../../utils/format';
import { useWeightUnit } from '../../auth/useWeightUnit';
import type { TotalsComparison } from '../compare';

function Tile({ label, value, delta }: { label: string; value: string; delta?: string | null }): JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</dd>
      {delta && <dd className="mt-0.5 text-xs tabular-nums text-muted-foreground">{delta} vs anterior</dd>}
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
  const unit = useWeightUnit();
  const delta = (now: number, before: number | undefined, unit?: string): string | null =>
    before === undefined ? null : signedDelta(now - before, unit);

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile label="Duración" value={durationSeconds === null ? '—' : formatDuration(durationSeconds)} />
      <Tile label="Peso movido" value={formatWeight(current.volume, unit)} delta={delta(current.volume, previous?.volume, unit)} />
      <Tile label="Series hechas" value={String(current.completedSets)} delta={delta(current.completedSets, previous?.completedSets)} />
      <Tile label="Reps totales" value={String(current.totalReps)} delta={delta(current.totalReps, previous?.totalReps)} />
    </dl>
  );
}
