import { useId, type JSX } from 'react';
import { Check } from 'lucide-react';
import type { FieldErrors } from '../../../utils/validation';
import { formatRepRange, formatWeight } from '../../../utils/format';
import { SetTypeBadge } from '../../exercises/components/SetTypeBadge';
import { SET_TYPE_LABELS } from '../../exercises/set-type-styles';
import type { RowEntry, WorkoutRow } from '../workout-model';
import { toInputText } from '../workout-model';

/** "Anterior: 100 kg × 7 [Top set]" — what was done last time for this set. */
function PreviousCell({ row }: { row: WorkoutRow }): JSX.Element {
  const previous = row.previous;
  if (!previous) return <span className="text-slate-400">Anterior: —</span>;

  const weight = previous.actualWeight === null ? 'sin peso' : formatWeight(previous.actualWeight);
  const reps = previous.actualReps ?? '—';
  return (
    <span className={previous.completed ? 'text-slate-600' : 'text-slate-400'}>
      Anterior: <span className="font-medium tabular-nums">{weight} × {reps}</span>
      {previous.setType !== row.setType && <> [{SET_TYPE_LABELS[previous.setType]}]</>}
      {!previous.completed && ' (no completada)'}
    </span>
  );
}

interface InputProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string | undefined;
  decimal?: boolean;
  onChange: (value: string) => void;
}

function CompactInput({ label, value, placeholder, error, decimal, onChange }: InputProps): JSX.Element {
  const id = useId();
  return (
    <div className="w-20">
      <label htmlFor={id} className="block text-[11px] font-medium text-slate-500">{label}</label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        inputMode={decimal ? 'decimal' : 'numeric'}
        aria-invalid={error ? true : undefined}
        title={error}
        onChange={(event) => onChange(event.target.value)}
        className={`h-10 w-full rounded-lg border bg-white px-2 text-center text-base tabular-nums shadow-sm placeholder:text-slate-400 focus:outline-2 ${
          error ? 'border-red-400 focus:outline-red-500' : 'border-slate-300 focus:outline-indigo-600'
        }`}
      />
    </div>
  );
}

interface WorkoutSetRowProps {
  row: WorkoutRow;
  exerciseName: string;
  entry: RowEntry;
  errors: FieldErrors | undefined;
  onValue: (field: 'weight' | 'reps', value: string) => void;
  onToggle: () => void;
}

export function WorkoutSetRow({ row, exerciseName, entry, errors, onValue, onToggle }: WorkoutSetRowProps): JSX.Element {
  const target = `${formatRepRange(row.targetRepMin, row.targetRepMax)} reps${
    row.targetWeight === null ? '' : ` · ${formatWeight(row.targetWeight)}`
  }`;
  const errorText = errors?.actualWeight ?? errors?.actualReps;

  return (
    <li className={`flex flex-wrap items-end gap-x-3 gap-y-2 rounded-xl p-2.5 transition-colors ${entry.completed ? 'bg-emerald-50' : 'bg-slate-50'}`}>
      <div className="min-w-0 basis-full space-y-1 text-sm sm:flex-1 sm:basis-auto">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700">{row.setNumber}</span>
          <SetTypeBadge type={row.setType} />
          <span className="text-slate-500">Obj. {target}</span>
        </div>
        <div className="text-xs"><PreviousCell row={row} /></div>
        {errorText && <p className="text-xs text-red-600">{errorText}</p>}
      </div>
      <div className="ml-auto flex items-end gap-2">
        <CompactInput label="kg" decimal value={entry.weight} placeholder={toInputText(row.suggestedWeight) || '—'} error={errors?.actualWeight} onChange={(v) => onValue('weight', v)} />
        <CompactInput label="reps" value={entry.reps} placeholder={String(row.suggestedReps)} error={errors?.actualReps} onChange={(v) => onValue('reps', v)} />
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={entry.completed}
          // Toggle button: fixed, unique label; the state is conveyed by aria-pressed.
          aria-label={`${exerciseName}, serie ${row.setNumber} hecha`}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            entry.completed ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-300 hover:border-emerald-500 hover:text-emerald-500'
          }`}
        >
          <Check className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
