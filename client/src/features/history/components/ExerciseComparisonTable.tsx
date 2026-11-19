import type { JSX } from 'react';
import { Trophy } from 'lucide-react';
import { formatWeight, signedDelta } from '../../../utils/format';
import type { ExerciseComparison } from '../compare';
import type { BestSet } from '../stats';

const setText = (set: BestSet | null): string =>
  set ? `${set.weight === null ? 'sin peso' : formatWeight(set.weight)} × ${set.reps}` : '—';

/** Best set of each exercise today vs the previous session, with e1RM change and records. */
export function ExerciseComparisonTable({ rows }: { rows: ExerciseComparison[] }): JSX.Element {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <table className="w-full min-w-[32rem] text-sm">
        <caption className="sr-only">Comparativa por ejercicio con la sesión anterior</caption>
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            <th scope="col" className="py-2 font-medium">Ejercicio</th>
            <th scope="col" className="py-2 font-medium">Mejor serie hoy</th>
            <th scope="col" className="py-2 font-medium">Anterior</th>
            <th scope="col" className="py-2 text-right font-medium">e1RM</th>
            <th scope="col" className="py-2 text-right font-medium">Δ e1RM</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 tabular-nums">
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="py-2 pr-2 text-left font-medium text-slate-800">
                {row.name}
                {row.isRecord && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                    <Trophy className="h-3 w-3" aria-hidden="true" />
                    Récord
                  </span>
                )}
              </th>
              <td className="py-2">{setText(row.best)}</td>
              <td className="py-2 text-slate-500">{setText(row.previousBest)}</td>
              <td className="py-2 text-right font-semibold">{row.best?.e1rm == null ? '—' : formatWeight(row.best.e1rm)}</td>
              <td className="py-2 text-right text-slate-600">{row.delta === null ? '—' : signedDelta(row.delta, 'kg')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
