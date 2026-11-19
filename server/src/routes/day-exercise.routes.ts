import { Router } from 'express';
import {
  dayExerciseInputSchema,
  dayExerciseUpdateSchema,
  reorderExercisesSchema,
} from '@gym/shared';
import type { DayExerciseController } from '../controllers/day-exercise.controller.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import { dayParamsSchema, exerciseParamsSchema } from '../schemas/params.schema.js';

const byDay = validateParams(dayParamsSchema);
const byExercise = validateParams(exerciseParamsSchema);

export function createDayExerciseRouter(controller: DayExerciseController): Router {
  const router = Router();

  router.post('/days/:dayId/exercises', byDay, validateBody(dayExerciseInputSchema), controller.create);
  router.put(
    '/days/:dayId/exercises/order',
    byDay,
    validateBody(reorderExercisesSchema),
    controller.reorder,
  );

  router.put(
    '/exercises/:exerciseId',
    byExercise,
    validateBody(dayExerciseUpdateSchema),
    controller.update,
  );
  router.delete('/exercises/:exerciseId', byExercise, controller.delete);

  return router;
}
