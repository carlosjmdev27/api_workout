import express, { type Express } from 'express';
import type { DayExerciseController } from './controllers/day-exercise.controller.js';
import type { RoutineController } from './controllers/routine.controller.js';
import type { SessionController } from './controllers/session.controller.js';
import type { WorkoutDayController } from './controllers/workout-day.controller.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { securityMiddlewares } from './middlewares/security.middleware.js';
import { createDayExerciseRouter } from './routes/day-exercise.routes.js';
import { createHealthRouter } from './routes/health.routes.js';
import { createRoutineRouter } from './routes/routine.routes.js';
import { createSessionRouter } from './routes/session.routes.js';
import { createWorkoutDayRouter } from './routes/workout-day.routes.js';

export interface AppControllers {
  routine: RoutineController;
  workoutDay: WorkoutDayController;
  dayExercise: DayExerciseController;
  session: SessionController;
}

export interface AppDependencies {
  corsOrigin: string;
  isProduction: boolean;
  controllers: AppControllers;
}

/** Builds the Express app. Receives its dependencies so it can be tested in isolation. */
export function createApp({ corsOrigin, isProduction, controllers }: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(securityMiddlewares(corsOrigin));
  app.use(express.json({ limit: '10kb' }));

  app.use('/api', createHealthRouter());
  app.use('/api', createRoutineRouter(controllers.routine));
  app.use('/api', createWorkoutDayRouter(controllers.workoutDay));
  app.use('/api', createDayExerciseRouter(controllers.dayExercise));
  app.use('/api', createSessionRouter(controllers.session));

  app.use(notFoundHandler);
  app.use(errorHandler(isProduction));

  return app;
}
