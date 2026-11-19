import { z } from 'zod';
import { EQUIPMENT, MUSCLE_GROUPS } from '../catalog.js';
import { LIMITS } from '../limits.js';
import { requiredText } from './common.schema.js';

/** A custom exercise created by the user (always saved with isCustom = true). */
export const catalogExerciseInputSchema = z.strictObject({
  name: requiredText(LIMITS.NAME_MAX),
  muscleGroup: z.enum(MUSCLE_GROUPS),
  equipment: z.enum(EQUIPMENT).nullish(),
});

/** Query string of GET /exercises/catalog (both optional). */
export const catalogQuerySchema = z.strictObject({
  q: z.string().trim().max(LIMITS.NAME_MAX).optional(),
  muscle: z.enum(MUSCLE_GROUPS).optional(),
});

export type CatalogExerciseInput = z.infer<typeof catalogExerciseInputSchema>;
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
