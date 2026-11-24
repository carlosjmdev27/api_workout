import { z } from 'zod';
import { LIMITS } from '../limits.js';
import { SET_TYPES } from '../set-types.js';
import {
  AT_LEAST_ONE_FIELD,
  hasAnyField,
  idListSchema,
  optionalText,
  requiredText,
  uuidSchema,
} from './common.schema.js';

/**
 * One planned set. `setNumber` is not sent: the server assigns 1..n
 * from the position in the `sets` array, so there are never gaps or duplicates.
 */
export const plannedSetInputSchema = z
  .strictObject({
    setType: z.enum(SET_TYPES),
    targetRepMin: z.number().int().min(1).max(LIMITS.REPS_MAX),
    targetRepMax: z.number().int().min(1).max(LIMITS.REPS_MAX),
    targetWeight: z.number().min(0).max(LIMITS.WEIGHT_MAX).nullish(),
    targetRir: z.number().int().min(0).max(LIMITS.RIR_MAX).nullish(),
  })
  .refine((set) => set.targetRepMin <= set.targetRepMax, {
    message: 'targetRepMin must be less than or equal to targetRepMax',
    path: ['targetRepMax'],
  });

export const dayExerciseInputSchema = z.strictObject({
  name: requiredText(LIMITS.NAME_MAX),
  /** Optional link to the exercise catalog; null = free-text exercise. */
  catalogExerciseId: uuidSchema.nullish(),
  notes: optionalText(LIMITS.NOTES_MAX),
  sets: z.array(plannedSetInputSchema).min(1).max(LIMITS.SETS_PER_EXERCISE_MAX),
});

/** Partial update. If `sets` is sent, it replaces all the planned sets. */
export const dayExerciseUpdateSchema = dayExerciseInputSchema
  .partial()
  .refine(hasAnyField, AT_LEAST_ONE_FIELD);

export const reorderExercisesSchema = z.strictObject({
  exerciseIds: idListSchema(LIMITS.EXERCISES_PER_DAY_MAX),
});

export type PlannedSetInput = z.infer<typeof plannedSetInputSchema>;
export type DayExerciseInput = z.infer<typeof dayExerciseInputSchema>;
export type DayExerciseUpdate = z.infer<typeof dayExerciseUpdateSchema>;
export type ReorderExercisesInput = z.infer<typeof reorderExercisesSchema>;
