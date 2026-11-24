import type { JSX } from 'react';
import { Trophy } from 'lucide-react';
import { formatWeight, signedDelta } from '../../../utils/format';
import { useWeightUnit } from '../../auth/useWeightUnit';
import type { ExerciseComparison } from '../compare';
import type { BestSet } from '../stats';

const setText = (set: BestSet | null, unit: string): string =>
  set ? `${set.weight === null ? 'sin peso' : formatWeight(set.weight, unit)} × ${set.reps}` : '—';

/** Best set of each exercise today vs the previous session: real weight and reps only. */
export function ExerciseComparisonTable({ rows }: { rows: ExerciseComparison[] }): JSX.Element {
  const unit = useWeightUnit();
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card p-4 shadow-sm">
      <table className="w-full min-w-[32rem] text-sm">
        <caption className="sr-only">Comparativa por ejercicio con la sesión anterior</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th scope="col" className="py-2 font-medium">Ejercicio</th>
            <th scope="col" className="py-2 font-medium">Mejor serie hoy</th>
            <th scope="col" className="py-2 font-medium">Anterior</th>
            <th scope="col" className="py-2 text-right font-medium">Δ peso máx.</th>
            <th scope="col" className="py-2 text-right font-medium">Reps totales</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 tabular-nums">
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="py-2 pr-2 text-left font-medium text-foreground">
                {row.name}
                {row.isRecord && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/30">
                    <Trophy className="h-3 w-3" aria-hidden="true" />
                    Récord
                  </span>
                )}
              </th>
              <td className="py-2 font-semibold">{setText(row.best, unit)}</td>
              <td className="py-2 text-muted-foreground">{setText(row.previousBest, unit)}</td>
              <td className="py-2 text-right text-muted-foreground">{row.weightDelta === null ? '—' : signedDelta(row.weightDelta, unit)}</td>
              <td className="py-2 text-right">
                {row.totalReps}
                {row.repsDelta !== null && <span className="ml-1 text-xs text-muted-foreground">({signedDelta(row.repsDelta)})</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
