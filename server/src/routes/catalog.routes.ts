import { Router } from 'express';
import { catalogExerciseInputSchema, catalogQuerySchema } from '@gym/shared';
import type { CatalogController } from '../controllers/catalog.controller.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';

/** Mounted before the day-exercise router so "/exercises/catalog" is never read as an id. */
export function createCatalogRouter(controller: CatalogController): Router {
  const router = Router();

  router.get('/exercises/catalog', validateQuery(catalogQuerySchema), controller.search);
  router.post('/exercises/catalog', validateBody(catalogExerciseInputSchema), controller.create);

  return router;
}
