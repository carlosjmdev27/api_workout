import { z } from 'zod';
import { LIMITS } from '../limits.js';
import { AT_LEAST_ONE_FIELD, hasAnyField, optionalText, requiredText } from './common.schema.js';

export const routineInputSchema = z.strictObject({
  name: requiredText(LIMITS.NAME_MAX),
  description: optionalText(LIMITS.DESCRIPTION_MAX),
});

export const routineUpdateSchema = routineInputSchema.partial().refine(hasAnyField, AT_LEAST_ONE_FIELD);

export type RoutineInput = z.infer<typeof routineInputSchema>;
export type RoutineUpdate = z.infer<typeof routineUpdateSchema>;
