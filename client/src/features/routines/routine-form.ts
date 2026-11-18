import type { FormErrors } from '../../types/form';
import type { Routine, UpdateRoutineInput } from '../../types/routine';
import { LIMITS } from '../../utils/limits';
import { checkText, compactErrors, toOptionalText } from '../../utils/validation';

export interface RoutineFormValues {
  name: string;
  description: string;
}

export type RoutineField = keyof RoutineFormValues;

export const EMPTY_ROUTINE: RoutineFormValues = { name: '', description: '' };

export function routineToFormValues(routine: Routine): RoutineFormValues {
  return { name: routine.name, description: routine.description ?? '' };
}

export function validateRoutine(values: RoutineFormValues): FormErrors<RoutineFormValues> {
  return compactErrors<RoutineFormValues>({
    name: checkText(values.name, { max: LIMITS.ROUTINE_NAME_MAX, required: true }),
    description: checkText(values.description, { max: LIMITS.ROUTINE_DESCRIPTION_MAX }),
  });
}

export function toRoutineFields(values: RoutineFormValues): Required<UpdateRoutineInput> {
  return { name: values.name.trim(), description: toOptionalText(values.description) };
}
