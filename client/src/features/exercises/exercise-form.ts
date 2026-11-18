import type { Exercise, ExerciseInput } from '../../types/exercise';
import type { FormErrors } from '../../types/form';
import { LIMITS } from '../../utils/limits';
import {
  checkNumber,
  checkText,
  compactErrors,
  parseDecimal,
  toOptionalText,
} from '../../utils/validation';

/** Raw form state: every field is the string typed by the user. */
export interface ExerciseFormValues {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restSeconds: string;
  notes: string;
}

export type ExerciseField = keyof ExerciseFormValues;

export const EMPTY_EXERCISE: ExerciseFormValues = {
  name: '',
  sets: '3',
  reps: '10',
  weight: '',
  restSeconds: '',
  notes: '',
};

export function exerciseToFormValues(exercise: Exercise): ExerciseFormValues {
  return {
    name: exercise.name,
    sets: String(exercise.sets),
    reps: exercise.reps,
    weight: exercise.weight === null ? '' : String(exercise.weight),
    restSeconds: exercise.restSeconds === null ? '' : String(exercise.restSeconds),
    notes: exercise.notes ?? '',
  };
}

export function validateExercise(values: ExerciseFormValues): FormErrors<ExerciseFormValues> {
  return compactErrors<ExerciseFormValues>({
    name: checkText(values.name, { max: LIMITS.EXERCISE_NAME_MAX, required: true }),
    sets: checkNumber(values.sets, {
      min: 1,
      max: LIMITS.EXERCISE_SETS_MAX,
      integer: true,
      required: true,
    }),
    reps: checkText(values.reps, { max: LIMITS.EXERCISE_REPS_MAX, required: true }),
    weight: checkNumber(values.weight, { min: 0, max: LIMITS.EXERCISE_WEIGHT_MAX_KG }),
    restSeconds: checkNumber(values.restSeconds, {
      min: 0,
      max: LIMITS.EXERCISE_REST_MAX_SECONDS,
      integer: true,
    }),
    notes: checkText(values.notes, { max: LIMITS.EXERCISE_NOTES_MAX }),
  });
}

/** Converts already-validated form values into the API payload. */
export function toExerciseInput(values: ExerciseFormValues): ExerciseInput {
  return {
    name: values.name.trim(),
    sets: parseDecimal(values.sets) ?? 0,
    reps: values.reps.trim(),
    weight: parseDecimal(values.weight),
    restSeconds: parseDecimal(values.restSeconds),
    notes: toOptionalText(values.notes),
  };
}
