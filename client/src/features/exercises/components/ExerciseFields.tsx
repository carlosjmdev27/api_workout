import type { JSX } from 'react';
import { TextAreaField, TextField } from '../../../components/FormField';
import type { FormErrors } from '../../../types/form';
import { LIMITS } from '../../../utils/limits';
import type { ExerciseField, ExerciseFormValues } from '../exercise-form';

interface ExerciseFieldsProps {
  values: ExerciseFormValues;
  errors: FormErrors<ExerciseFormValues>;
  onChange: (field: ExerciseField, value: string) => void;
}

/** Controlled inputs of one exercise. Reused by the create form and the exercise dialog. */
export function ExerciseFields({ values, errors, onChange }: ExerciseFieldsProps): JSX.Element {
  return (
    <div className="space-y-4">
      <TextField
        label="Nombre del ejercicio"
        required
        value={values.name}
        error={errors.name}
        maxLength={LIMITS.EXERCISE_NAME_MAX}
        placeholder="Press de banca con barra"
        onChange={(event) => onChange('name', event.target.value)}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TextField
          label="Series"
          required
          inputMode="numeric"
          value={values.sets}
          error={errors.sets}
          onChange={(event) => onChange('sets', event.target.value)}
        />
        <TextField
          label="Repeticiones"
          required
          value={values.reps}
          error={errors.reps}
          maxLength={LIMITS.EXERCISE_REPS_MAX}
          placeholder="8-10"
          onChange={(event) => onChange('reps', event.target.value)}
        />
        <TextField
          label="Peso (kg)"
          inputMode="decimal"
          value={values.weight}
          error={errors.weight}
          placeholder="60,5"
          onChange={(event) => onChange('weight', event.target.value)}
        />
        <TextField
          label="Descanso (s)"
          inputMode="numeric"
          value={values.restSeconds}
          error={errors.restSeconds}
          placeholder="90"
          onChange={(event) => onChange('restSeconds', event.target.value)}
        />
      </div>
      <TextAreaField
        label="Notas"
        rows={2}
        value={values.notes}
        error={errors.notes}
        maxLength={LIMITS.EXERCISE_NOTES_MAX}
        placeholder="Técnica, tempo, variantes…"
        onChange={(event) => onChange('notes', event.target.value)}
      />
    </div>
  );
}
