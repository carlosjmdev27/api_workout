import { resolve } from 'node:path';
import type { Express } from 'express';
import { createApp } from './app.js';
import type { Env } from './config/env.js';
import { SERVER_ROOT } from './config/paths.js';
import { CatalogController } from './controllers/catalog.controller.js';
import { DayExerciseController } from './controllers/day-exercise.controller.js';
import { RoutineController } from './controllers/routine.controller.js';
import { SessionController } from './controllers/session.controller.js';
import { WorkoutDayController } from './controllers/workout-day.controller.js';
import { openDatabase } from './repositories/sqlite/connection.js';
import { SqliteCatalogRepository } from './repositories/sqlite/sqlite-catalog.repository.js';
import { SqliteDayExerciseRepository } from './repositories/sqlite/sqlite-day-exercise.repository.js';
import { SqliteRoutineRepository } from './repositories/sqlite/sqlite-routine.repository.js';
import { SqliteSessionRepository } from './repositories/sqlite/sqlite-session.repository.js';
import { SqliteWorkoutDayRepository } from './repositories/sqlite/sqlite-workout-day.repository.js';
import { CatalogService } from './services/catalog.service.js';
import { DayExerciseService } from './services/day-exercise.service.js';
import { RoutineService } from './services/routine.service.js';
import { SessionService } from './services/session.service.js';
import { WorkoutDayService } from './services/workout-day.service.js';

export interface Container {
  app: Express;
  close: () => void;
}

/**
 * Composition root: the only place that knows the concrete implementations.
 * Switching to PostgreSQL means swapping the four repositories built here.
 */
export function buildContainer(env: Env): Container {
  const db = openDatabase(resolve(SERVER_ROOT, env.DATABASE_PATH));

  const routineService = new RoutineService(new SqliteRoutineRepository(db));
  const dayService = new WorkoutDayService(new SqliteWorkoutDayRepository(db), routineService);
  const catalogService = new CatalogService(new SqliteCatalogRepository(db));
  const exerciseService = new DayExerciseService(new SqliteDayExerciseRepository(db), dayService, catalogService);
  const sessionService = new SessionService(new SqliteSessionRepository(db), dayService);

  const app = createApp({
    corsOrigin: env.CORS_ORIGIN,
    isProduction: env.NODE_ENV === 'production',
    controllers: {
      routine: new RoutineController(routineService),
      workoutDay: new WorkoutDayController(dayService),
      dayExercise: new DayExerciseController(exerciseService),
      session: new SessionController(sessionService),
      catalog: new CatalogController(catalogService),
    },
  });

  return { app, close: () => db.close() };
}
