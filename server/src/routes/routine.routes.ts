import { Router } from 'express';
import { routineInputSchema, routineUpdateSchema } from '@gym/shared';
import type { RoutineController } from '../controllers/routine.controller.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import { routineParamsSchema } from '../schemas/params.schema.js';

const byRoutine = validateParams(routineParamsSchema);

export function createRoutineRouter(controller: RoutineController): Router {
  const router = Router();

  router.get('/routines', controller.list);
  router.post('/routines', validateBody(routineInputSchema), controller.create);
  router.get('/routines/:routineId', byRoutine, controller.getById);
  router.put('/routines/:routineId', byRoutine, validateBody(routineUpdateSchema), controller.update);
  router.delete('/routines/:routineId', byRoutine, controller.delete);

  return router;
}
