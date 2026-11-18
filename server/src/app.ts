import express, { type Express } from 'express';
import type { ExerciseController } from './controllers/exercise.controller.js';
import type { RoutineController } from './controllers/routine.controller.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { securityMiddlewares } from './middlewares/security.middleware.js';
import { createExerciseRouter } from './routes/exercise.routes.js';
import { createHealthRouter } from './routes/health.routes.js';
import { createRoutineRouter } from './routes/routine.routes.js';

export interface AppDependencies {
  corsOrigin: string;
  isProduction: boolean;
  routineController: RoutineController;
  exerciseController: ExerciseController;
}

/** Builds the Express app. Receives its dependencies so it can be tested in isolation. */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(securityMiddlewares(deps.corsOrigin));
  app.use(express.json({ limit: '10kb' }));

  app.use('/api', createHealthRouter());
  app.use('/api', createRoutineRouter(deps.routineController));
  app.use('/api', createExerciseRouter(deps.exerciseController));

  app.use(notFoundHandler);
  app.use(errorHandler(deps.isProduction));

  return app;
}
