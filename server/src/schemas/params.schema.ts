import { uuidSchema } from '@gym/shared';
import { z } from 'zod';

/** Route params (server-only). Body schemas live in @gym/shared. */
export const routineParamsSchema = z.strictObject({ routineId: uuidSchema });
export const dayParamsSchema = z.strictObject({ dayId: uuidSchema });
export const exerciseParamsSchema = z.strictObject({ exerciseId: uuidSchema });
export const sessionParamsSchema = z.strictObject({ sessionId: uuidSchema });

export type RoutineParams = z.infer<typeof routineParamsSchema>;
export type DayParams = z.infer<typeof dayParamsSchema>;
export type ExerciseParams = z.infer<typeof exerciseParamsSchema>;
export type SessionParams = z.infer<typeof sessionParamsSchema>;
