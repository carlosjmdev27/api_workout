import { useState } from 'react';
import { LIMITS, type DayExerciseInput, type SetType } from '@gym/shared';
import type { FieldErrors } from '../../utils/validation';
import {
  newSetRow,
  validateExercise,
  type ExerciseFormValues,
  type SetNumberField,
} from './exercise-form';

/** State and actions of the per-set exercise editor. */
export function useExerciseEditor(initialValues: ExerciseFormValues) {
  const [values, setValues] = useState<ExerciseFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});

  const canAddSet = values.sets.length < LIMITS.SETS_PER_EXERCISE_MAX;
  const canRemoveSet = values.sets.length > 1;

  const setText = (field: 'name' | 'notes', value: string): void => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const updateSet = (index: number, patch: Partial<Record<SetNumberField, string>> | { setType: SetType }): void => {
    setValues((previous) => ({
      ...previous,
      sets: previous.sets.map((set, i) => (i === index ? { ...set, ...patch } : set)),
    }));
  };

  /** Structural changes shift row indexes, so old per-row errors no longer apply. */
  const changeRows = (build: (sets: ExerciseFormValues['sets']) => ExerciseFormValues['sets']): void => {
    setValues((previous) => ({ ...previous, sets: build(previous.sets) }));
    setErrors({});
  };

  /** "+ Añadir serie": copies the last row to speed up entry. */
  const addSet = (): void => {
    if (canAddSet) changeRows((sets) => [...sets, newSetRow(sets.at(-1))]);
  };

  const duplicateSet = (index: number): void => {
    if (!canAddSet) return;
    changeRows((sets) => [...sets.slice(0, index + 1), newSetRow(sets[index]), ...sets.slice(index + 1)]);
  };

  const removeSet = (index: number): void => {
    if (canRemoveSet) changeRows((sets) => sets.filter((_, i) => i !== index));
  };

  /** Shows the errors and returns the API payload when everything is valid. */
  const validate = (): DayExerciseInput | null => {
    const result = validateExercise(values);
    setErrors(result.ok ? {} : result.errors);
    return result.ok ? result.data : null;
  };

  return {
    values,
    errors,
    canAddSet,
    canRemoveSet,
    setText,
    updateSet,
    addSet,
    duplicateSet,
    removeSet,
    validate,
  };
}

export type ExerciseEditor = ReturnType<typeof useExerciseEditor>;
