import { useState, type FormEvent, type JSX } from 'react';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import type { ExerciseInput } from '../../../types/exercise';
import type { FormErrors } from '../../../types/form';
import { getErrorDetails, getErrorMessage } from '../../../utils/errors';
import { hasErrors } from '../../../utils/validation';
import {
  toExerciseInput,
  validateExercise,
  type ExerciseField,
  type ExerciseFormValues,
} from '../exercise-form';
import { ExerciseFields } from './ExerciseFields';

interface ExerciseFormProps {
  initialValues: ExerciseFormValues;
  submitLabel: string;
  pending: boolean;
  error: unknown;
  onSubmit: (input: ExerciseInput) => void;
  onCancel: () => void;
}

/** Standalone exercise form with its own state and validation. */
export function ExerciseForm({
  initialValues,
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
}: ExerciseFormProps): JSX.Element {
  const [values, setValues] = useState<ExerciseFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<ExerciseFormValues>>({});

  const handleChange = (field: ExerciseField, value: string): void => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateExercise(values);
    setErrors(nextErrors);
    if (!hasErrors(nextErrors)) onSubmit(toExerciseInput(values));
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <ExerciseFields values={values} errors={errors} onChange={handleChange} />
      {error !== null && (
        <Alert message={getErrorMessage(error)} details={getErrorDetails(error)} />
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
