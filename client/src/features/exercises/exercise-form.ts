import {
  dayExerciseInputSchema,
  type DayExercise,
  type DayExerciseInput,
  type SetType,
} from '@gym/shared';
import { parseDecimal, validateWith, type ValidationResult } from '../../utils/validation';

/** One editable set row. Numeric fields are kept as typed text until submit. */
export interface SetRowValues {
  key: string; // Stable React key: rows have no server id while editing.
  setType: SetType;
  targetWeight: string;
  targetRepMin: string;
  targetRepMax: string;
  targetRir: string;
}

export type SetNumberField = 'targetWeight' | 'targetRepMin' | 'targetRepMax' | 'targetRir';

export interface ExerciseFormValues {
  name: string;
  /** Set when the name was picked from (or created in) the catalog. */
  catalogExerciseId: string | null;
  notes: string;
  sets: SetRowValues[];
}

const DEFAULT_SET: Omit<SetRowValues, 'key'> = {
  setType: 'normal',
  targetWeight: '',
  targetRepMin: '8',
  targetRepMax: '12',
  targetRir: '',
};

/** New row; when `from` is given it copies its configuration (duplicate / add). */
export function newSetRow(from?: SetRowValues): SetRowValues {
  return { ...(from ?? DEFAULT_SET), key: crypto.randomUUID() };
}

export function emptyExercise(): ExerciseFormValues {
  return { name: '', catalogExerciseId: null, notes: '', sets: [newSetRow(), newSetRow(), newSetRow()] };
}

const toText = (value: number | null): string => (value === null ? '' : String(value));

export function exerciseToFormValues(exercise: DayExercise): ExerciseFormValues {
  return {
    name: exercise.name,
    catalogExerciseId: exercise.catalogExerciseId,
    notes: exercise.notes ?? '',
    sets: exercise.sets.map((set) => ({
      key: set.id,
      setType: set.setType,
      targetWeight: toText(set.targetWeight),
      targetRepMin: String(set.targetRepMin),
      targetRepMax: String(set.targetRepMax),
      targetRir: toText(set.targetRir),
    })),
  };
}

/** Validates with the API schema. Errors are keyed like "sets.2.targetRepMax". */
export function validateExercise(values: ExerciseFormValues): ValidationResult<DayExerciseInput> {
  return validateWith(dayExerciseInputSchema, {
    name: values.name,
    catalogExerciseId: values.catalogExerciseId,
    notes: values.notes,
    sets: values.sets.map((set) => ({
      setType: set.setType,
      targetWeight: parseDecimal(set.targetWeight),
      targetRepMin: parseDecimal(set.targetRepMin),
      targetRepMax: parseDecimal(set.targetRepMax),
      targetRir: parseDecimal(set.targetRir),
    })),
  });
}
