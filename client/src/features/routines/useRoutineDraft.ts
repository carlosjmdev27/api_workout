import { useState } from 'react';
import type { FormErrors } from '../../types/form';
import type { CreateRoutineInput } from '../../types/routine';
import { hasErrors } from '../../utils/validation';
import {
  EMPTY_EXERCISE,
  toExerciseInput,
  validateExercise,
  type ExerciseField,
  type ExerciseFormValues,
} from '../exercises/exercise-form';
import {
  EMPTY_ROUTINE,
  toRoutineFields,
  validateRoutine,
  type RoutineField,
  type RoutineFormValues,
} from './routine-form';

export interface ExerciseDraft {
  key: string; // Stable React key; drafts have no server id yet.
  values: ExerciseFormValues;
}

export type DraftErrors = Record<string, FormErrors<ExerciseFormValues>>;

/** State and validation of the "new routine" form (routine + its exercises). */
export function useRoutineDraft() {
  const [info, setInfo] = useState<RoutineFormValues>(EMPTY_ROUTINE);
  const [drafts, setDrafts] = useState<ExerciseDraft[]>([]);
  const [infoErrors, setInfoErrors] = useState<FormErrors<RoutineFormValues>>({});
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});

  const updateInfo = (field: RoutineField, value: string): void => {
    setInfo((previous) => ({ ...previous, [field]: value }));
  };

  const addDraft = (): void => {
    setDrafts((previous) => [...previous, { key: crypto.randomUUID(), values: EMPTY_EXERCISE }]);
  };

  const removeDraft = (key: string): void => {
    setDrafts((previous) => previous.filter((draft) => draft.key !== key));
  };

  const updateDraft = (key: string, field: ExerciseField, value: string): void => {
    setDrafts((previous) =>
      previous.map((draft) =>
        draft.key === key ? { ...draft, values: { ...draft.values, [field]: value } } : draft,
      ),
    );
  };

  /** Validates everything and shows the errors. Returns true when valid. */
  const validate = (): boolean => {
    const nextInfoErrors = validateRoutine(info);
    const nextDraftErrors: DraftErrors = {};
    drafts.forEach((draft) => {
      const errors = validateExercise(draft.values);
      if (hasErrors(errors)) nextDraftErrors[draft.key] = errors;
    });
    setInfoErrors(nextInfoErrors);
    setDraftErrors(nextDraftErrors);
    return !hasErrors(nextInfoErrors) && Object.keys(nextDraftErrors).length === 0;
  };

  const toInput = (): CreateRoutineInput => ({
    ...toRoutineFields(info),
    exercises: drafts.map((draft) => toExerciseInput(draft.values)),
  });

  return {
    info,
    drafts,
    infoErrors,
    draftErrors,
    updateInfo,
    addDraft,
    removeDraft,
    updateDraft,
    validate,
    toInput,
  };
}
