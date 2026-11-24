import type { JSX } from 'react';
import { Copy, X } from 'lucide-react';
import type { SetType } from '@gym/shared';
import { IconButton } from '../../../components/IconButton';
import type { FieldErrors } from '../../../utils/validation';
import type { SetNumberField, SetRowValues } from '../exercise-form';
import { SetTypeSelect } from './SetTypeSelect';

/** Shared by the header and the rows so the columns line up. */
export const SET_EDITOR_GRID = 'grid grid-cols-[1.25rem_4.5rem_repeat(4,minmax(0,1fr))_3.5rem] items-center gap-1';

const FIELD_NAMES: Record<SetNumberField, string> = {
  targetWeight: 'Peso',
  targetRepMin: 'Reps mín',
  targetRepMax: 'Reps máx',
  targetRir: 'RIR',
};

interface NumberCellProps {
  label: string;
  value: string;
  error?: string | undefined;
  placeholder?: string;
  decimal?: boolean;
  onChange: (value: string) => void;
}

/** 32px numeric input; the column header is its visual label, `label` its accessible one. */
function NumberCell({ label, value, error, placeholder, decimal, onChange }: NumberCellProps): JSX.Element {
  return (
    <input
      aria-label={label}
      value={value}
      inputMode={decimal ? 'decimal' : 'numeric'}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
      title={error}
      onChange={(event) => onChange(event.target.value)}
      className={`h-8 w-full min-w-0 rounded-md border bg-card px-1 text-center text-sm focus:outline-2 ${
        error ? 'border-destructive focus:outline-destructive' : 'border-input focus:outline-ring'
      }`}
    />
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
  const rowErrors = (Object.keys(FIELD_NAMES) as SetNumberField[]).flatMap((field) => {
    const message = error(field);
    return message ? [`${FIELD_NAMES[field]}: ${message}`] : [];
  });
  const cell = (field: SetNumberField, extra: Partial<NumberCellProps> = {}): JSX.Element => (
    <NumberCell
      label={`${FIELD_NAMES[field]} de la serie ${number}`}
      value={row[field]}
      error={error(field)}
      onChange={(value) => onValueChange(field, value)}
      {...extra}
    />
  );

  return (
    <li className="py-0.5">
      <div className={SET_EDITOR_GRID}>
        <span className="text-center text-sm font-semibold text-muted-foreground">{number}</span>
        <SetTypeSelect value={row.setType} label={`Tipo de la serie ${number}`} compact onChange={onTypeChange} />
        {cell('targetWeight', { decimal: true, placeholder: '—', label: `Peso de la serie ${number} (kg)` })}
        {cell('targetRepMin')}
        {cell('targetRepMax')}
        {cell('targetRir', { placeholder: '—' })}
        <div className="flex">
          <IconButton icon={Copy} label={`Duplicar serie ${number}`} onClick={onDuplicate} disabled={!canDuplicate} className="p-1.5" />
          <IconButton icon={X} tone="danger" label={`Quitar serie ${number}`} onClick={onRemove} disabled={!canRemove} className="p-1.5" />
        </div>
      </div>
      {rowErrors.length > 0 && (
        <p className="mt-0.5 pl-6 text-[11px] leading-tight text-destructive">Serie {number} · {rowErrors.join(' · ')}</p>
      )}
    </li>
  );
}
