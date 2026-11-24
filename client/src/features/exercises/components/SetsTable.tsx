import type { JSX } from 'react';
import { Plus } from 'lucide-react';
import type { PlannedSet } from '@gym/shared';
import { formatNumber, formatRepRange } from '../../../utils/format';
import { SetTypeBadge } from './SetTypeBadge';

interface SetsTableProps {
  sets: PlannedSet[];
  /** e.g. "Añadir serie a Press banca"; the footer row only renders with `onAddSet`. */
  addLabel?: string;
  addDisabled?: boolean;
  onAddSet?: () => void;
}

const CELL = 'py-1 tabular-nums';

/** Dense read-only view of the planned sets, with an optional "+ Añadir serie" footer row. */
export function SetsTable({ sets, addLabel, addDisabled = false, onAddSet }: SetsTableProps): JSX.Element {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
          <th scope="col" className="w-12 py-1 font-medium">Serie</th>
          <th scope="col" className="py-1 font-medium">Tipo</th>
          <th scope="col" className="py-1 text-right font-medium">Peso (kg)</th>
          <th scope="col" className="py-1 text-right font-medium">Reps</th>
          <th scope="col" className="w-12 py-1 text-right font-medium">RIR</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        {sets.map((set) => (
          <tr key={set.id}>
            <td className={`${CELL} text-muted-foreground`}>{set.setNumber}</td>
            <td className="py-1"><SetTypeBadge type={set.setType} compact /></td>
            <td className={`${CELL} text-right`}>{set.targetWeight === null ? '—' : formatNumber(set.targetWeight)}</td>
            <td className={`${CELL} text-right font-medium`}>{formatRepRange(set.targetRepMin, set.targetRepMax)}</td>
            <td className={`${CELL} text-right text-muted-foreground`}>{set.targetRir ?? '—'}</td>
          </tr>
        ))}
      </tbody>
      {onAddSet && (
        <tfoot>
          <tr>
            <td colSpan={5} className="pt-0.5">
              <button
                type="button"
                onClick={onAddSet}
                disabled={addDisabled}
                aria-label={addLabel}
                className="flex h-7 w-full items-center gap-1 rounded-md px-1 text-xs font-medium text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:text-muted-foreground/70 disabled:hover:bg-transparent"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Añadir serie
              </button>
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
