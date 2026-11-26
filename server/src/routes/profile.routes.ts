import { Router } from 'express';
import { personalProfileSchema, physicalProfileSchema, weightLogInputSchema } from '@gym/shared';
import type { ProfileController } from '../controllers/profile.controller.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import { weightLogParamsSchema } from '../schemas/params.schema.js';

/** Mounted after requireAuth: every route acts on the logged-in user only. */
export function createProfileRouter(controller: ProfileController): Router {
  const router = Router();

  router.put('/profile/personal', validateBody(personalProfileSchema), controller.updatePersonal);
  router.put('/profile/physical', validateBody(physicalProfileSchema), controller.updatePhysical);
  router.get('/profile/weight-logs', controller.listWeightLogs);
  router.post('/profile/weight-logs', validateBody(weightLogInputSchema), controller.addWeightLog);
  router.delete('/profile/weight-logs/:logId', validateParams(weightLogParamsSchema), controller.deleteWeightLog);

  return router;
}
