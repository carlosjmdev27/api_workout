import { routineInputSchema, type Routine, type RoutineInput } from '@gym/shared';
import { validateWith, type ValidationResult } from '../../utils/validation';

export interface RoutineFormValues {
  name: string;
  description: string;
}

export type RoutineField = keyof RoutineFormValues;

export const EMPTY_ROUTINE: RoutineFormValues = { name: '', description: '' };

export function routineToFormValues(routine: Routine): RoutineFormValues {
  return { name: routine.name, description: routine.description ?? '' };
}

/** Same schema as the API ("" description becomes null). */
export function validateRoutine(values: RoutineFormValues): ValidationResult<RoutineInput> {
  return validateWith(routineInputSchema, values);
}
