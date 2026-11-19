import type { JSX } from 'react';
import { Check, ChevronDown, Trash2 } from 'lucide-react';
import type { LoggedSet, WorkoutSession } from '@gym/shared';
import { IconButton } from '../../../components/IconButton';
import { formatDateTime, formatDuration, formatWeight } from '../../../utils/format';
import { SetTypeBadge } from '../../exercises/components/SetTypeBadge';
import { sessionTotals } from '../stats';

function Metric({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <dt className="text-[11px] text-slate-500">{label}</dt>
      <dd className="font-semibold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}

/** Logged sets grouped by exercise, in workout order. */
function groupByExercise(sets: LoggedSet[]): { name: string; sets: LoggedSet[] }[] {
  const groups = new Map<string, { name: string; sets: LoggedSet[] }>();
  sets.forEach((set) => {
    const key = `${set.exerciseOrder}#${set.exerciseName}`;
    const group = groups.get(key) ?? { name: set.exerciseName, sets: [] };
    group.sets.push(set);
    groups.set(key, group);
  });
  return [...groups.values()];
}

interface SessionCardProps {
  session: WorkoutSession;
  onDelete: () => void;
}

/** One past session: summary metrics (always visible) + expandable logged sets. */
export function SessionCard({ session, onDelete }: SessionCardProps): JSX.Element {
  const totals = sessionTotals(session);

  return (
    <li className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900">{formatDateTime(session.completedAt)}</p>
            <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
              <Metric label="Duración" value={session.durationMinutes === null ? '—' : formatDuration(session.durationMinutes)} />
              <Metric label="Series hechas" value={String(totals.completedSets)} />
              <Metric label="Reps totales" value={String(totals.totalReps)} />
              <Metric label="Peso movido" value={formatWeight(totals.volume)} />
            </dl>
          </div>
        </summary>
        <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-3">
          {groupByExercise(session.sets).map((group) => (
            <div key={group.name}>
              <h3 className="text-sm font-medium text-slate-800">{group.name}</h3>
              <ul className="mt-1 space-y-1 text-sm">
                {group.sets.map((set) => (
                  <li key={set.id} className="flex items-center gap-2 tabular-nums">
                    <span className="w-4 text-slate-500">{set.setNumber}</span>
                    <SetTypeBadge type={set.setType} />
                    <span>{set.actualWeight === null ? 'sin peso' : formatWeight(set.actualWeight)} × {set.actualReps ?? '—'}</span>
                    {set.completed ? (
                      <Check className="h-4 w-4 text-emerald-600" aria-label="completada" />
                    ) : (
                      <span className="text-xs text-slate-400">no completada</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {session.notes && <p className="whitespace-pre-line rounded-lg bg-slate-50 p-2 text-sm text-slate-600">{session.notes}</p>}
          <div className="flex justify-end">
            <IconButton icon={Trash2} tone="danger" label="Eliminar esta sesión" onClick={onDelete} />
          </div>
        </div>
      </details>
    </li>
  );
}
