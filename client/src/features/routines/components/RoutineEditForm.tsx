import { useState, type FormEvent, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FormErrors } from '../../../types/form';
import type { RoutineWithExercises } from '../../../types/routine';
import { hasErrors } from '../../../utils/validation';
import { useUpdateRoutine } from '../hooks';
import {
  routineToFormValues,
  toRoutineFields,
  validateRoutine,
  type RoutineField,
  type RoutineFormValues,
} from '../routine-form';
import { FormActions } from './FormActions';
import { RoutineInfoFields } from './RoutineInfoFields';

export function RoutineEditForm({ routine }: { routine: RoutineWithExercises }): JSX.Element {
  const [values, setValues] = useState<RoutineFormValues>(() => routineToFormValues(routine));
  const [errors, setErrors] = useState<FormErrors<RoutineFormValues>>({});
  const updateMutation = useUpdateRoutine(routine.id);
  const navigate = useNavigate();
  const detailPath = `/routines/${routine.id}`;

  const handleChange = (field: RoutineField, value: string): void => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateRoutine(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    updateMutation.mutate(toRoutineFields(values), {
      onSuccess: () => navigate(detailPath),
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <RoutineInfoFields values={values} errors={errors} onChange={handleChange} />
      <p className="text-sm text-slate-500">
        Los ejercicios se añaden, editan y reordenan desde la vista de la rutina.
      </p>
      <FormActions
        cancelTo={detailPath}
        submitLabel="Guardar cambios"
        pending={updateMutation.isPending}
        error={updateMutation.error}
      />
    </form>
  );
}
