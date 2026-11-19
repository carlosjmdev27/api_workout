import { useId, type JSX } from 'react';
import { Copy, X } from 'lucide-react';
import type { SetType } from '@gym/shared';
import { IconButton } from '../../../components/IconButton';
import type { FieldErrors } from '../../../utils/validation';
import type { SetNumberField, SetRowValues } from '../exercise-form';
import { SetTypeSelect } from './SetTypeSelect';

interface NumberCellProps {
  label: string;
  value: string;
  error?: string | undefined;
  placeholder?: string;
  decimal?: boolean;
  onChange: (value: string) => void;
}

/** Compact numeric input with a tiny visible label and inline error. */
function NumberCell({ label, value, error, placeholder, decimal, onChange }: NumberCellProps): JSX.Element {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[11px] font-medium text-slate-500">
        {label}
      </label>
      <input
        id={id}
        value={value}
        inputMode={decimal ? 'decimal' : 'numeric'}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`h-9 w-full rounded-lg border bg-white px-2 text-center text-sm shadow-sm focus:outline-2 ${
          error ? 'border-red-400 focus:outline-red-500' : 'border-slate-300 focus:outline-indigo-600'
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-0.5 text-[11px] leading-tight text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface SetRowEditorProps {
  row: SetRowValues;
  index: number;
  errors: FieldErrors;
  canDuplicate: boolean;
  canRemove: boolean;
  onTypeChange: (type: SetType) => void;
  onValueChange: (field: SetNumberField, value: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function SetRowEditor({
  row,
  index,
  errors,
  canDuplicate,
  canRemove,
  onTypeChange,
  onValueChange,
  onDuplicate,
  onRemove,
}: SetRowEditorProps): JSX.Element {
  const number = index + 1;
  const error = (field: SetNumberField): string | undefined => errors[`sets.${index}.${field}`];

  return (
    <li className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
      <div className="flex flex-wrap items-end gap-2 sm:flex-nowrap">
        <span className="flex h-9 w-6 shrink-0 items-center justify-center text-sm font-semibold text-slate-500">
          {number}
        </span>
        <div className="min-w-0 flex-1 sm:w-36 sm:flex-none">
          <SetTypeSelect value={row.setType} label={`Tipo de la serie ${number}`} onChange={onTypeChange} />
        </div>
        <div className="order-last grid w-full grid-cols-4 gap-2 sm:order-none sm:w-auto sm:flex-1">
          <NumberCell label="Peso kg" decimal value={row.targetWeight} placeholder="—" error={error('targetWeight')} onChange={(v) => onValueChange('targetWeight', v)} />
          <NumberCell label="Reps mín" value={row.targetRepMin} error={error('targetRepMin')} onChange={(v) => onValueChange('targetRepMin', v)} />
          <NumberCell label="Reps máx" value={row.targetRepMax} error={error('targetRepMax')} onChange={(v) => onValueChange('targetRepMax', v)} />
          <NumberCell label="RIR" value={row.targetRir} placeholder="—" error={error('targetRir')} onChange={(v) => onValueChange('targetRir', v)} />
        </div>
        <div className="flex shrink-0">
          <IconButton icon={Copy} label={`Duplicar serie ${number}`} onClick={onDuplicate} disabled={!canDuplicate} />
          <IconButton icon={X} tone="danger" label={`Quitar serie ${number}`} onClick={onRemove} disabled={!canRemove} />
        </div>
      </div>
    </li>
  );
}
