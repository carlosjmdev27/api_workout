import { useState, type FormEvent, type JSX } from 'react';
import type { RoutineInput } from '@gym/shared';
import type { FieldErrors } from '../../../utils/validation';
import { validateRoutine, type RoutineField, type RoutineFormValues } from '../routine-form';
import { FormActions } from './FormActions';
import { RoutineInfoFields } from './RoutineInfoFields';

interface RoutineFormProps {
  initialValues: RoutineFormValues;
  submitLabel: string;
  cancelTo: string;
  pending: boolean;
  error: unknown;
  hint?: string;
  onSubmit: (input: RoutineInput) => void;
}

/** Create / edit form for the routine itself (its tables are managed in the detail view). */
export function RoutineForm({
  initialValues,
  submitLabel,
  cancelTo,
  pending,
  error,
  hint,
  onSubmit,
}: RoutineFormProps): JSX.Element {
  const [values, setValues] = useState<RoutineFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleChange = (field: RoutineField, value: string): void => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const result = validateRoutine(values);
    setErrors(result.ok ? {} : result.errors);
    if (result.ok) onSubmit(result.data);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <RoutineInfoFields values={values} errors={errors} onChange={handleChange} />
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
      <FormActions cancelTo={cancelTo} submitLabel={submitLabel} pending={pending} error={error} />
    </form>
  );
}
