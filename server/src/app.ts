import express, { type Express, type RequestHandler } from 'express';
import type { AuthController } from './controllers/auth.controller.js';
import type { CatalogController } from './controllers/catalog.controller.js';
import type { DayExerciseController } from './controllers/day-exercise.controller.js';
import type { RoutineController } from './controllers/routine.controller.js';
import type { SessionController } from './controllers/session.controller.js';
import type { WorkoutDayController } from './controllers/workout-day.controller.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { securityMiddlewares } from './middlewares/security.middleware.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createCatalogRouter } from './routes/catalog.routes.js';
import { createDayExerciseRouter } from './routes/day-exercise.routes.js';
import { createHealthRouter } from './routes/health.routes.js';
import { createRoutineRouter } from './routes/routine.routes.js';
import { createSessionRouter } from './routes/session.routes.js';
import { createWorkoutDayRouter } from './routes/workout-day.routes.js';

export interface AppControllers {
  auth: AuthController;
  routine: RoutineController;
  workoutDay: WorkoutDayController;
  dayExercise: DayExerciseController;
  session: SessionController;
  catalog: CatalogController;
}

export interface AppDependencies {
  corsOrigin: string;
  isProduction: boolean;
  /** Number of reverse proxies in front (0 = none). */
  trustProxy: number;
  /** Rejects requests without a valid bearer token. */
  requireAuth: RequestHandler;
  controllers: AppControllers;
}

/** Builds the Express app. Receives its dependencies so it can be tested in isolation. */
export function createApp({ corsOrigin, isProduction, trustProxy, requireAuth, controllers }: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  // Behind nginx, req.ip must be the client's IP (X-Forwarded-For) for rate limiting.
  if (trustProxy > 0) app.set('trust proxy', trustProxy);
  app.use(securityMiddlewares(corsOrigin));
  app.use(express.json({ limit: '10kb' }));

  // Public.
  app.use('/api', createHealthRouter());
  app.use('/api', createAuthRouter(controllers.auth, requireAuth));

  // Everything below requires a session.
  app.use('/api', requireAuth);
  app.use('/api', createRoutineRouter(controllers.routine));
  app.use('/api', createWorkoutDayRouter(controllers.workoutDay));
  app.use('/api', createCatalogRouter(controllers.catalog)); // Before /exercises/:exerciseId.
  app.use('/api', createDayExerciseRouter(controllers.dayExercise));
  app.use('/api', createSessionRouter(controllers.session));

  app.use(notFoundHandler);
  app.use(errorHandler(isProduction));

  return app;
}
