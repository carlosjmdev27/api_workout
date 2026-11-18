import { Router } from 'express';
import type { RoutineController } from '../controllers/routine.controller.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import { routineParamsSchema } from '../schemas/common.schema.js';
import { createRoutineSchema, updateRoutineSchema } from '../schemas/routine.schema.js';

const byId = validateParams(routineParamsSchema);

export function createRoutineRouter(controller: RoutineController): Router {
  const router = Router();

  router.get('/routines', controller.list);
  router.post('/routines', validateBody(createRoutineSchema), controller.create);
  router.get('/routines/:routineId', byId, controller.getById);
  router.put('/routines/:routineId', byId, validateBody(updateRoutineSchema), controller.update);
  router.delete('/routines/:routineId', byId, controller.delete);

  return router;
}
