import type { JSX } from 'react';
import { LIMITS } from '@gym/shared';
import { TextAreaField, TextField } from '../../../components/FormField';
import type { FieldErrors } from '../../../utils/validation';
import type { RoutineField, RoutineFormValues } from '../routine-form';

interface RoutineInfoFieldsProps {
  values: RoutineFormValues;
  errors: FieldErrors;
  onChange: (field: RoutineField, value: string) => void;
}

/** Name + description inputs of a routine. */
export function RoutineInfoFields({ values, errors, onChange }: RoutineInfoFieldsProps): JSX.Element {
  return (
    <div className="space-y-4">
      <TextField
        label="Nombre"
        required
        autoFocus
        value={values.name}
        error={errors.name}
        maxLength={LIMITS.NAME_MAX}
        placeholder="Torso-Pierna 4 días"
        onChange={(event) => onChange('name', event.target.value)}
      />
      <TextAreaField
        label="Descripción"
        value={values.description}
        error={errors.description}
        maxLength={LIMITS.DESCRIPTION_MAX}
        hint={`Opcional · máximo ${LIMITS.DESCRIPTION_MAX} caracteres`}
        placeholder="Objetivo del mesociclo, frecuencia, observaciones…"
        onChange={(event) => onChange('description', event.target.value)}
      />
    </div>
  );
}
