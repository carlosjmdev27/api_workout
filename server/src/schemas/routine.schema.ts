import { z } from 'zod';
import { LIMITS } from '../config/limits.js';
import type { CreateRoutineInput, UpdateRoutineInput } from '../types/routine.types.js';
import { optionalText, requiredText } from './common.schema.js';
import { exerciseInputSchema } from './exercise.schema.js';

export const createRoutineSchema = z.strictObject({
  name: requiredText(LIMITS.ROUTINE_NAME_MAX),
  description: optionalText(LIMITS.ROUTINE_DESCRIPTION_MAX),
  exercises: z.array(exerciseInputSchema).max(LIMITS.EXERCISES_PER_ROUTINE_MAX).optional(),
}) satisfies z.ZodType<CreateRoutineInput>;

export const updateRoutineSchema = z
  .strictObject({
    name: requiredText(LIMITS.ROUTINE_NAME_MAX).optional(),
    description: optionalText(LIMITS.ROUTINE_DESCRIPTION_MAX),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }) satisfies z.ZodType<UpdateRoutineInput>;
