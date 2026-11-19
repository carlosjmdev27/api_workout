import { z } from 'zod';
import { LIMITS } from '../limits.js';
import { SET_TYPES } from '../set-types.js';
import { optionalText, uuidSchema } from './common.schema.js';

/** A set actually performed during a session. */
export const loggedSetInputSchema = z.strictObject({
  dayExerciseId: uuidSchema,
  setNumber: z.number().int().min(1).max(LIMITS.SETS_PER_EXERCISE_MAX),
  setType: z.enum(SET_TYPES),
  actualWeight: z.number().min(0).max(LIMITS.WEIGHT_MAX_KG).nullish(),
  actualReps: z.number().int().min(0).max(LIMITS.REPS_MAX).nullish(),
  completed: z.boolean(),
});

export const sessionInputSchema = z.strictObject({
  workoutDayId: uuidSchema,
  /** Defaults to "now" on the server. */
  completedAt: z.iso.datetime().optional(),
  durationMinutes: z.number().int().min(1).max(LIMITS.SESSION_DURATION_MAX_MINUTES).nullish(),
  notes: optionalText(LIMITS.NOTES_MAX),
  sets: z
    .array(loggedSetInputSchema)
    .min(1)
    .max(LIMITS.SESSION_SETS_MAX)
    .refine(
      (sets) => new Set(sets.map((s) => `${s.dayExerciseId}#${s.setNumber}`)).size === sets.length,
      { message: 'Each (dayExerciseId, setNumber) pair must be unique' },
    ),
});

export type LoggedSetInput = z.infer<typeof loggedSetInputSchema>;
export type SessionInput = z.infer<typeof sessionInputSchema>;
