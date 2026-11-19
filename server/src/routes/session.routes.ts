import { Router } from 'express';
import { sessionInputSchema } from '@gym/shared';
import type { SessionController } from '../controllers/session.controller.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import { dayParamsSchema, sessionParamsSchema } from '../schemas/params.schema.js';

export function createSessionRouter(controller: SessionController): Router {
  const router = Router();

  router.post('/sessions', validateBody(sessionInputSchema), controller.create);
  router.get('/sessions/:sessionId', validateParams(sessionParamsSchema), controller.getById);
  router.delete('/sessions/:sessionId', validateParams(sessionParamsSchema), controller.delete);
  router.get('/days/:dayId/history', validateParams(dayParamsSchema), controller.historyByDay);

  return router;
}
