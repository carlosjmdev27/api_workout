import { useRef, type JSX, type RefObject } from 'react';
import { Check } from 'lucide-react';
import type { FieldErrors } from '../../../utils/validation';
import { formatNumber, formatRepRange } from '../../../utils/format';
import { SetTypeBadge } from '../../exercises/components/SetTypeBadge';
import { SET_TYPE_LABELS } from '../../exercises/set-type-styles';
import type { RowEntry } from '../active-workout';
import type { WorkoutRow } from '../workout-model';

/** "100 × 7": what was done last time for this set (details in the tooltip). */
function PreviousCell({ row }: { row: WorkoutRow }): JSX.Element {
  const previous = row.previous;
  if (!previous) return <span className="text-slate-400">—</span>;
  const weight = previous.actualWeight === null ? '—' : formatNumber(previous.actualWeight);
  const notes = [
    previous.setType !== row.setType ? SET_TYPE_LABELS[previous.setType] : '',
    previous.completed ? '' : 'no completada',
  ].filter(Boolean).join(', ');
  return (
    <span title={notes || undefined} className={previous.completed ? 'text-slate-600' : 'italic text-slate-400'}>
      {weight} × {previous.actualReps ?? '—'}
      {notes && <span className="sr-only"> ({notes})</span>}
    </span>
  );
}

interface InputProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string | undefined;
  /** Tooltip with the target ("Objetivo: 6–8"). */
  hint: string;
  decimal?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
}

/** 32px-high input; its visible label is the column header, so it carries an aria-label. */
function CellInput({ label, value, placeholder, error, hint, decimal, inputRef, onChange }: InputProps): JSX.Element {
  return (
    <input
      ref={inputRef}
      aria-label={label}
      value={value}
      placeholder={placeholder}
      inputMode={decimal ? 'decimal' : 'numeric'}
      aria-invalid={error ? true : undefined}
      title={error ?? hint}
      onChange={(event) => onChange(event.target.value)}
      className={`h-8 w-full rounded-md border bg-white px-1 text-center text-base tabular-nums placeholder:text-slate-400 focus:outline-2 ${
        error ? 'border-red-400 focus:outline-red-500' : 'border-slate-300 focus:outline-indigo-600'
      }`}
    />
  );
}

interface WorkoutSetRowProps {
  row: WorkoutRow;
  exerciseName: string;
  entry: RowEntry;
  errors: FieldErrors | undefined;
  onValue: (field: 'weight' | 'reps', value: string) => void;
  onToggle: () => boolean;
}

/** One set as a dense table row: Serie | Tipo | Anterior | Peso | Reps | ✓ (+ error line). */
export function WorkoutSetRow({ row, exerciseName, entry, errors, onValue, onToggle }: WorkoutSetRowProps): JSX.Element {
  const repsRef = useRef<HTMLInputElement>(null);
  const range = formatRepRange(row.targetRepMin, row.targetRepMax);
  const of = `de la serie ${row.setNumber} de ${exerciseName}`;
  const errorText = errors?.actualReps ?? errors?.actualWeight;
  const weightHint = row.targetWeight === null ? 'Sin peso objetivo' : `Objetivo: ${formatNumber(row.targetWeight)} kg`;

  const handleToggle = (): void => {
    if (!onToggle()) repsRef.current?.focus(); // Reps missing: take the user straight there.
  };

  return (
    <>
      <tr className={`transition-colors ${entry.completed ? 'bg-emerald-50' : ''}`}>
        <td className="py-1 pl-1 font-semibold tabular-nums">
          {row.isExtra ? (
            <span className="text-indigo-600" title="Serie extra">{row.setNumber}<span className="sr-only"> (extra)</span></span>
          ) : (
            <span className="text-slate-700">{row.setNumber}</span>
          )}
        </td>
        <td className="py-1"><SetTypeBadge type={row.setType} compact /></td>
        <td className="truncate py-1 text-xs tabular-nums"><PreviousCell row={row} /></td>
        <td className="py-1 pr-1">
          <CellInput label={`Peso ${of} (kg)`} decimal value={entry.weight} placeholder="—" error={errors?.actualWeight} hint={weightHint} onChange={(v) => onValue('weight', v)} />
        </td>
        <td className="py-1 pr-1">
          <CellInput label={`Reps ${of} (objetivo ${range})`} value={entry.reps} placeholder={range} error={errors?.actualReps} hint={`Objetivo: ${range} reps`} inputRef={repsRef} onChange={(v) => onValue('reps', v)} />
        </td>
        <td className="py-1 pr-1">
          <button
            type="button"
            onClick={handleToggle}
            aria-pressed={entry.completed}
            // Toggle button: fixed, unique label; the state is conveyed by aria-pressed.
            aria-label={`${exerciseName}, serie ${row.setNumber} hecha`}
            className={`flex h-8 w-8 items-center justify-center rounded-md border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              entry.completed ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-300 hover:border-emerald-500 hover:text-emerald-500'
            }`}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </button>
        </td>
      </tr>
      {errorText && (
        <tr>
          <td colSpan={6} role="alert" className="pb-1 pl-1 text-xs text-red-600">Serie {row.setNumber}: {errorText}</td>
        </tr>
      )}
    </>
  );
}
