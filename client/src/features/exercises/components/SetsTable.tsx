import type { JSX } from 'react';
import type { PlannedSet } from '@gym/shared';
import { formatRepRange, formatWeight } from '../../../utils/format';
import { SetTypeBadge } from './SetTypeBadge';

/** Read-only view of the planned sets of an exercise. */
export function SetsTable({ sets }: { sets: PlannedSet[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500">
            <th scope="col" className="w-8 py-1 font-medium">#</th>
            <th scope="col" className="py-1 font-medium">Tipo</th>
            <th scope="col" className="py-1 text-right font-medium">Peso</th>
            <th scope="col" className="py-1 text-right font-medium">Reps</th>
            <th scope="col" className="py-1 text-right font-medium">RIR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sets.map((set) => (
            <tr key={set.id}>
              <td className="py-1.5 text-slate-500">{set.setNumber}</td>
              <td className="py-1.5"><SetTypeBadge type={set.setType} /></td>
              <td className="py-1.5 text-right tabular-nums">
                {set.targetWeight === null ? '—' : formatWeight(set.targetWeight)}
              </td>
              <td className="py-1.5 text-right font-medium tabular-nums">
                {formatRepRange(set.targetRepMin, set.targetRepMax)}
              </td>
              <td className="py-1.5 text-right tabular-nums text-slate-500">{set.targetRir ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
