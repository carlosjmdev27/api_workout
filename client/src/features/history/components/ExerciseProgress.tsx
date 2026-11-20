import { useId, useState, type JSX } from 'react';
import type { WorkoutSession } from '@gym/shared';
import { formatShortDate, formatWeight, signedDelta } from '../../../utils/format';
import { exerciseOptions, exerciseProgress, type ProgressPoint } from '../stats';
import { ProgressChart, type ChartPoint } from './ProgressChart';

const bestSetText = (p: ProgressPoint): string =>
  `${p.bestWeight === null ? 'sin peso' : formatWeight(p.bestWeight)} × ${p.bestReps}`;

/** Change of the heaviest weight vs the previous session ("—" when either has no weight). */
function delta(points: ProgressPoint[], index: number): string {
  const current = points[index]?.bestWeight;
  const previous = points[index - 1]?.bestWeight;
  if (current === null || current === undefined || previous === null || previous === undefined) return '—';
  return signedDelta(current - previous);
}

/** Per-exercise progressive overload: max-weight chart + chronological table (the table view). */
export function ExerciseProgress({ sessions }: { sessions: WorkoutSession[] }): JSX.Element {
  const options = exerciseOptions(sessions);
  const [selected, setSelected] = useState(options[0]?.key ?? '');
  const selectId = useId();
  const key = options.some((o) => o.key === selected) ? selected : (options[0]?.key ?? '');
  const name = options.find((o) => o.key === key)?.name ?? '';
  const points = exerciseProgress(sessions, key);
  const chartPoints: ChartPoint[] = points.flatMap((p) =>
    p.bestWeight === null ? [] : [{ id: p.sessionId, date: p.date, value: p.bestWeight, detail: `mejor serie ${bestSetText(p)}` }],
  );

  return (
    <section aria-labelledby={`${selectId}-title`} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 id={`${selectId}-title`} className="text-lg font-semibold text-slate-900">Progresión por ejercicio</h2>
        <div className="sm:w-64">
          <label htmlFor={selectId} className="block text-xs font-medium text-slate-500">Ejercicio</label>
          <select id={selectId} value={key} onChange={(e) => setSelected(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm shadow-sm focus:outline-2 focus:outline-indigo-600">
            {options.map((o) => <option key={o.key} value={o.key}>{o.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-700">Peso máximo de {name} por sesión (kg)</h3>
        {chartPoints.length > 0 ? (
          <ProgressChart points={chartPoints} unit="kg" label={`Peso máximo de ${name} por sesión`} />
        ) : (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Este ejercicio no tiene series con peso: sigue su progresión con las reps de la tabla.</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <caption className="sr-only">Progresión de {name} por sesión</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th scope="col" className="py-2 font-medium">Fecha</th>
              <th scope="col" className="py-2 font-medium">Mejor serie</th>
              <th scope="col" className="py-2 text-right font-medium">Δ peso máx.</th>
              <th scope="col" className="py-2 text-right font-medium">Reps</th>
              <th scope="col" className="py-2 text-right font-medium">Peso movido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 tabular-nums">
            {[...points].reverse().map((p) => {
              const index = points.indexOf(p);
              return (
                <tr key={p.sessionId}>
                  <td className="py-2 text-slate-600">{formatShortDate(p.date)}</td>
                  <td className="py-2 font-semibold">{bestSetText(p)}</td>
                  <td className="py-2 text-right text-slate-600">{delta(points, index)}</td>
                  <td className="py-2 text-right">{p.totalReps}</td>
                  <td className="py-2 text-right">{formatWeight(p.volume)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
