import { useId, useState, type JSX } from 'react';
import type { WorkoutSession } from '@gym/shared';
import { formatShortDate, formatWeight, signedDelta } from '../../../utils/format';
import { exerciseOptions, exerciseProgress, type ProgressPoint } from '../stats';
import { Card } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
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

type Metric = 'weight' | 'volume';

/** Two measures on very different scales: one chart each, switched, never a dual axis. */
const METRICS: Record<Metric, { label: string; title: string; color: string; empty: string }> = {
  weight: {
    label: 'Peso máximo',
    title: 'Peso máximo',
    color: 'var(--chart-1)',
    empty: 'Este ejercicio no tiene series con peso: sigue su progresión con las reps de la tabla.',
  },
  volume: {
    label: 'Volumen',
    title: 'Volumen total (peso × reps)',
    color: 'var(--chart-2)',
    empty: 'Sin volumen: las series de este ejercicio no tienen peso.',
  },
};

function toChartPoints(points: ProgressPoint[], metric: Metric): ChartPoint[] {
  return points.flatMap((p) => {
    const value = metric === 'weight' ? p.bestWeight : p.volume;
    if (value === null || value <= 0) return [];
    const detail = metric === 'weight' ? `mejor serie ${bestSetText(p)}` : `${p.totalReps} reps en total`;
    return [{ id: p.sessionId, date: p.date, value, detail }];
  });
}

function MetricToggle({ metric, onChange }: { metric: Metric; onChange: (metric: Metric) => void }): JSX.Element {
  return (
    <div role="group" aria-label="Métrica de la gráfica" className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
      {(Object.keys(METRICS) as Metric[]).map((key) => (
        <button
          key={key}
          type="button"
          aria-pressed={metric === key}
          onClick={() => onChange(key)}
          className={`h-7 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
            metric === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {METRICS[key].label}
        </button>
      ))}
    </div>
  );
}

/** Per-exercise progressive overload: Recharts chart (max weight / volume) + chronological table (the table view). */
export function ExerciseProgress({ sessions }: { sessions: WorkoutSession[] }): JSX.Element {
  const options = exerciseOptions(sessions);
  const [selected, setSelected] = useState(options[0]?.key ?? '');
  const [metric, setMetric] = useState<Metric>('weight');
  const selectId = useId();
  const key = options.some((o) => o.key === selected) ? selected : (options[0]?.key ?? '');
  const name = options.find((o) => o.key === key)?.name ?? '';
  const points = exerciseProgress(sessions, key);
  const chartPoints = toChartPoints(points, metric);
  const { title, color, empty } = METRICS[metric];

  return (
    <Card aria-labelledby={`${selectId}-title`} role="region" className="gap-4 px-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 id={`${selectId}-title`} className="text-lg font-semibold text-foreground">Progresión por ejercicio</h2>
        <div className="sm:w-64">
          <label htmlFor={selectId} className="block text-xs font-medium text-muted-foreground">Ejercicio</label>
          <NativeSelect id={selectId} value={key} onChange={(e) => setSelected(e.target.value)} className="mt-1 w-full">
            {options.map((o) => <NativeSelectOption key={o.key} value={o.key}>{o.name}</NativeSelectOption>)}
          </NativeSelect>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-foreground/90">{title} de {name} por sesión (kg)</h3>
          <MetricToggle metric={metric} onChange={setMetric} />
        </div>
        {chartPoints.length > 0 ? (
          <ProgressChart points={chartPoints} unit="kg" color={color} label={`${title} de ${name} por sesión`} />
        ) : (
          <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">{empty}</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <caption className="sr-only">Progresión de {name} por sesión</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 font-medium">Fecha</th>
              <th scope="col" className="py-2 font-medium">Mejor serie</th>
              <th scope="col" className="py-2 text-right font-medium">Δ peso máx.</th>
              <th scope="col" className="py-2 text-right font-medium">Reps</th>
              <th scope="col" className="py-2 text-right font-medium">Peso movido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 tabular-nums">
            {[...points].reverse().map((p) => {
              const index = points.indexOf(p);
              return (
                <tr key={p.sessionId}>
                  <td className="py-2 text-muted-foreground">{formatShortDate(p.date)}</td>
                  <td className="py-2 font-semibold">{bestSetText(p)}</td>
                  <td className="py-2 text-right text-muted-foreground">{delta(points, index)}</td>
                  <td className="py-2 text-right">{p.totalReps}</td>
                  <td className="py-2 text-right">{formatWeight(p.volume)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
