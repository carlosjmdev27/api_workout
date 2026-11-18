import { z } from 'zod';

/** Required trimmed text. */
export function requiredText(max: number): z.ZodString {
  return z.string().trim().min(1, 'Must not be empty').max(max);
}

/**
 * Optional trimmed text. An empty string is stored as null, so the client
 * can clear a field by sending "" or null.
 */
export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value))
    .nullish();
}

export const uuidSchema = z.uuid('Must be a valid UUID');

export const routineParamsSchema = z.strictObject({ routineId: uuidSchema });

export const exerciseParamsSchema = z.strictObject({
  routineId: uuidSchema,
  exerciseId: uuidSchema,
});

export type RoutineParams = z.infer<typeof routineParamsSchema>;
export type ExerciseParams = z.infer<typeof exerciseParamsSchema>;
