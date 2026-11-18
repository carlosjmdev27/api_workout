import { z } from 'zod';
import { LIMITS } from '../config/limits.js';
import type { ExerciseInput, ExerciseUpdate } from '../types/exercise.types.js';
import { optionalText, requiredText, uuidSchema } from './common.schema.js';

/** `satisfies` guarantees at compile time that the schema matches the domain type. */
export const exerciseInputSchema = z.strictObject({
  name: requiredText(LIMITS.EXERCISE_NAME_MAX),
  sets: z.number().int().min(1).max(LIMITS.EXERCISE_SETS_MAX),
  reps: requiredText(LIMITS.EXERCISE_REPS_MAX), // e.g. "12" or "8-10"
  weight: z.number().min(0).max(LIMITS.EXERCISE_WEIGHT_MAX_KG).nullish(),
  restSeconds: z.number().int().min(0).max(LIMITS.EXERCISE_REST_MAX_SECONDS).nullish(),
  notes: optionalText(LIMITS.EXERCISE_NOTES_MAX),
}) satisfies z.ZodType<ExerciseInput>;

export const exerciseUpdateSchema = exerciseInputSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }) satisfies z.ZodType<ExerciseUpdate>;

export const reorderExercisesSchema = z.strictObject({
  exerciseIds: z
    .array(uuidSchema)
    .min(1)
    .max(LIMITS.EXERCISES_PER_ROUTINE_MAX)
    .refine((ids) => new Set(ids).size === ids.length, { message: 'Ids must be unique' }),
});

export type ReorderExercisesBody = z.infer<typeof reorderExercisesSchema>;
