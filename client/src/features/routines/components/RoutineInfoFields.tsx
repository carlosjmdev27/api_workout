import type { JSX } from 'react';
import { TextAreaField, TextField } from '../../../components/FormField';
import type { FormErrors } from '../../../types/form';
import { LIMITS } from '../../../utils/limits';
import type { RoutineField, RoutineFormValues } from '../routine-form';

interface RoutineInfoFieldsProps {
  values: RoutineFormValues;
  errors: FormErrors<RoutineFormValues>;
  onChange: (field: RoutineField, value: string) => void;
}

/** Name + description inputs, shared by the create and edit forms. */
export function RoutineInfoFields({ values, errors, onChange }: RoutineInfoFieldsProps): JSX.Element {
  return (
    <div className="space-y-4">
      <TextField
        label="Nombre"
        required
        autoFocus
        value={values.name}
        error={errors.name}
        maxLength={LIMITS.ROUTINE_NAME_MAX}
        placeholder="Torso / Pierna - Día 1"
        onChange={(event) => onChange('name', event.target.value)}
      />
      <TextAreaField
        label="Descripción"
        value={values.description}
        error={errors.description}
        maxLength={LIMITS.ROUTINE_DESCRIPTION_MAX}
        hint={`Opcional · máximo ${LIMITS.ROUTINE_DESCRIPTION_MAX} caracteres`}
        placeholder="Objetivo, frecuencia, observaciones…"
        onChange={(event) => onChange('description', event.target.value)}
      />
    </div>
  );
}
