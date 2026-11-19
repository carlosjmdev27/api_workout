import { z } from 'zod';
import { LIMITS } from '../limits.js';
import { idListSchema, requiredText } from './common.schema.js';

/** Create or rename a workout day ("tabla"). */
export const workoutDayInputSchema = z.strictObject({
  name: requiredText(LIMITS.NAME_MAX),
});

export const reorderDaysSchema = z.strictObject({
  dayIds: idListSchema(LIMITS.DAYS_PER_ROUTINE_MAX),
});

export type WorkoutDayInput = z.infer<typeof workoutDayInputSchema>;
export type ReorderDaysInput = z.infer<typeof reorderDaysSchema>;
