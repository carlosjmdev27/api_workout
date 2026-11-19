import { z } from 'zod';
import { LIMITS } from '../limits.js';
import { SET_TYPES } from '../set-types.js';
import { optionalText, uuidSchema } from './common.schema.js';

/**
 * A set actually performed. Only completed sets are sent, so reps are
 * mandatory; weight may be null (bodyweight exercises).
 * setNumber can exceed the plan: extra sets added on the fly.
 */
export const loggedSetInputSchema = z.strictObject({
  dayExerciseId: uuidSchema,
  setNumber: z.number().int().min(1).max(LIMITS.LOGGED_SET_NUMBER_MAX),
  setType: z.enum(SET_TYPES),
  actualWeight: z.number().min(0).max(LIMITS.WEIGHT_MAX_KG).nullish(),
  actualReps: z.number().int().min(0).max(LIMITS.REPS_MAX),
});

/**
 * Finished workout. The server derives duration_seconds from startedAt and
 * completedAt (single source of truth), so the client never sends a duration.
 */
export const sessionInputSchema = z
  .strictObject({
    workoutDayId: uuidSchema,
    startedAt: z.iso.datetime(),
    completedAt: z.iso.datetime(),
    notes: optionalText(LIMITS.NOTES_MAX),
    sets: z
      .array(loggedSetInputSchema)
      .min(1)
      .max(LIMITS.SESSION_SETS_MAX)
      .refine(
        (sets) => new Set(sets.map((s) => `${s.dayExerciseId}#${s.setNumber}`)).size === sets.length,
        { message: 'Each (dayExerciseId, setNumber) pair must be unique' },
      ),
  })
  .refine((session) => Date.parse(session.startedAt) <= Date.parse(session.completedAt), {
    message: 'startedAt must be before completedAt',
    path: ['completedAt'],
  });

export type LoggedSetInput = z.infer<typeof loggedSetInputSchema>;
export type SessionInput = z.infer<typeof sessionInputSchema>;
