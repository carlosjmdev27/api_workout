import { Router } from 'express';
import type { ExerciseController } from '../controllers/exercise.controller.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import { exerciseParamsSchema, routineParamsSchema } from '../schemas/common.schema.js';
import {
  exerciseInputSchema,
  exerciseUpdateSchema,
  reorderExercisesSchema,
} from '../schemas/exercise.schema.js';

const BASE = '/routines/:routineId/exercises';
const byRoutine = validateParams(routineParamsSchema);
const byExercise = validateParams(exerciseParamsSchema);

export function createExerciseRouter(controller: ExerciseController): Router {
  const router = Router();

  router.get(BASE, byRoutine, controller.list);
  router.post(BASE, byRoutine, validateBody(exerciseInputSchema), controller.create);
  // Declared before /:exerciseId so "order" is never taken as an id.
  router.put(`${BASE}/order`, byRoutine, validateBody(reorderExercisesSchema), controller.reorder);
  router.put(
    `${BASE}/:exerciseId`,
    byExercise,
    validateBody(exerciseUpdateSchema),
    controller.update,
  );
  router.delete(`${BASE}/:exerciseId`, byExercise, controller.delete);

  return router;
}
