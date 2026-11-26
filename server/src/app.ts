import compression from 'compression';
import express, { type Express, type RequestHandler } from 'express';
import type { AuthController } from './controllers/auth.controller.js';
import type { CatalogController } from './controllers/catalog.controller.js';
import type { ProfileController } from './controllers/profile.controller.js';
import type { DayExerciseController } from './controllers/day-exercise.controller.js';
import type { RoutineController } from './controllers/routine.controller.js';
import type { SessionController } from './controllers/session.controller.js';
import type { WorkoutDayController } from './controllers/workout-day.controller.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { securityMiddlewares } from './middlewares/security.middleware.js';
import { serveSpa } from './middlewares/spa.middleware.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createCatalogRouter } from './routes/catalog.routes.js';
import { createDayExerciseRouter } from './routes/day-exercise.routes.js';
import { createHealthRouter } from './routes/health.routes.js';
import { createProfileRouter } from './routes/profile.routes.js';
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
  profile: ProfileController;
}

export interface AppDependencies {
  /** Only when the web runs on another origin (dev); undefined = same origin, no CORS. */
  corsOrigin: string | undefined;
  /** Built React app to serve (production, single service); null = API only. */
  publicDir: string | null;
  isProduction: boolean;
  /** Number of reverse proxies in front (0 = none). */
  trustProxy: number;
  /** Rejects requests without a valid bearer token. */
  requireAuth: RequestHandler;
  controllers: AppControllers;
}

/** Builds the Express app. Receives its dependencies so it can be tested in isolation. */
export function createApp(deps: AppDependencies): Express {
  const { corsOrigin, publicDir, isProduction, trustProxy, requireAuth, controllers } = deps;
  const app = express();

  app.disable('x-powered-by');
  // Behind a proxy (nginx, Railway), req.ip must be the client's IP (X-Forwarded-For) for rate limiting.
  if (trustProxy > 0) app.set('trust proxy', trustProxy);
  app.use(securityMiddlewares(corsOrigin));
  app.use(compression()); // gzip for the JS bundle and JSON (no nginx in front on Railway).
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
  app.use('/api', createProfileRouter(controllers.profile));

  // Web (production): static files + SPA fallback for every non-/api GET.
  if (publicDir) app.use(serveSpa(publicDir));

  app.use(notFoundHandler);
  app.use(errorHandler(isProduction));

  return app;
}
