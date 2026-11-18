import { resolve } from 'node:path';
import type { Express } from 'express';
import { createApp } from './app.js';
import type { Env } from './config/env.js';
import { SERVER_ROOT } from './config/paths.js';
import { ExerciseController } from './controllers/exercise.controller.js';
import { RoutineController } from './controllers/routine.controller.js';
import { openDatabase } from './repositories/sqlite/connection.js';
import { SqliteExerciseRepository } from './repositories/sqlite/sqlite-exercise.repository.js';
import { SqliteRoutineRepository } from './repositories/sqlite/sqlite-routine.repository.js';
import { ExerciseService } from './services/exercise.service.js';
import { RoutineService } from './services/routine.service.js';

export interface Container {
  app: Express;
  close: () => void;
}

/**
 * Composition root: the only place that knows the concrete implementations.
 * Switching to PostgreSQL means swapping the two repositories built here.
 */
export function buildContainer(env: Env): Container {
  const db = openDatabase(resolve(SERVER_ROOT, env.DATABASE_PATH));

  const routineRepository = new SqliteRoutineRepository(db);
  const exerciseRepository = new SqliteExerciseRepository(db);

  const routineService = new RoutineService(routineRepository);
  const exerciseService = new ExerciseService(exerciseRepository, routineRepository);

  const app = createApp({
    corsOrigin: env.CORS_ORIGIN,
    isProduction: env.NODE_ENV === 'production',
    routineController: new RoutineController(routineService),
    exerciseController: new ExerciseController(exerciseService),
  });

  return { app, close: () => db.close() };
}
