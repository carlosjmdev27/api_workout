import { Router } from 'express';
import { reorderDaysSchema, workoutDayInputSchema } from '@gym/shared';
import type { WorkoutDayController } from '../controllers/workout-day.controller.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import { dayParamsSchema, routineParamsSchema } from '../schemas/params.schema.js';

const byRoutine = validateParams(routineParamsSchema);
const byDay = validateParams(dayParamsSchema);
const nameBody = validateBody(workoutDayInputSchema);

export function createWorkoutDayRouter(controller: WorkoutDayController): Router {
  const router = Router();

  router.get('/routines/:routineId/days', byRoutine, controller.listByRoutine);
  router.post('/routines/:routineId/days', byRoutine, nameBody, controller.create);
  router.put(
    '/routines/:routineId/days/order',
    byRoutine,
    validateBody(reorderDaysSchema),
    controller.reorder,
  );

  router.get('/days/:dayId', byDay, controller.getById);
  router.put('/days/:dayId', byDay, nameBody, controller.rename);
  router.delete('/days/:dayId', byDay, controller.delete);

  return router;
}
