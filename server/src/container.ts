import { resolve } from 'node:path';
import type { Express } from 'express';
import { createApp } from './app.js';
import type { Env } from './config/env.js';
import { SERVER_ROOT } from './config/paths.js';
import { AuthController } from './controllers/auth.controller.js';
import { CatalogController } from './controllers/catalog.controller.js';
import { DayExerciseController } from './controllers/day-exercise.controller.js';
import { RoutineController } from './controllers/routine.controller.js';
import { SessionController } from './controllers/session.controller.js';
import { WorkoutDayController } from './controllers/workout-day.controller.js';
import { authenticate } from './middlewares/auth.middleware.js';
import { openDatabase } from './repositories/sqlite/connection.js';
import { SqliteCatalogRepository } from './repositories/sqlite/sqlite-catalog.repository.js';
import { SqliteDayExerciseRepository } from './repositories/sqlite/sqlite-day-exercise.repository.js';
import { SqliteOwnershipRepository } from './repositories/sqlite/sqlite-ownership.repository.js';
import { SqliteRoutineRepository } from './repositories/sqlite/sqlite-routine.repository.js';
import { SqliteSessionRepository } from './repositories/sqlite/sqlite-session.repository.js';
import { SqliteUserRepository } from './repositories/sqlite/sqlite-user.repository.js';
import { SqliteWorkoutDayRepository } from './repositories/sqlite/sqlite-workout-day.repository.js';
import { AccessGuard } from './services/access.guard.js';
import { AuthService } from './services/auth.service.js';
import { CatalogService } from './services/catalog.service.js';
import { DayExerciseService } from './services/day-exercise.service.js';
import { PasswordService } from './services/password.service.js';
import { RoutineService } from './services/routine.service.js';
import { SessionService } from './services/session.service.js';
import { TokenService } from './services/token.service.js';
import { WorkoutDayService } from './services/workout-day.service.js';

export interface Container {
  app: Express;
  close: () => void;
}

/**
 * Composition root: the only place that knows the concrete implementations.
 * Switching to PostgreSQL means swapping the repositories built here.
 */
export function buildContainer(env: Env): Container {
  const db = openDatabase(resolve(SERVER_ROOT, env.DATABASE_PATH));

  const access = new AccessGuard(new SqliteOwnershipRepository(db));
  const authService = new AuthService(new SqliteUserRepository(db), new PasswordService(), new TokenService(env.JWT_SECRET), {
    allowRegistration: env.ALLOW_REGISTRATION,
  });
  const routineService = new RoutineService(new SqliteRoutineRepository(db), access);
  const dayService = new WorkoutDayService(new SqliteWorkoutDayRepository(db), access);
  const catalogService = new CatalogService(new SqliteCatalogRepository(db));
  const exerciseService = new DayExerciseService(new SqliteDayExerciseRepository(db), dayService, catalogService, access);
  const sessionService = new SessionService(new SqliteSessionRepository(db), dayService, access);

  const app = createApp({
    corsOrigin: env.CORS_ORIGIN,
    isProduction: env.NODE_ENV === 'production',
    trustProxy: env.TRUST_PROXY,
    requireAuth: authenticate(authService),
    controllers: {
      auth: new AuthController(authService),
      routine: new RoutineController(routineService),
      workoutDay: new WorkoutDayController(dayService),
      dayExercise: new DayExerciseController(exerciseService),
      session: new SessionController(sessionService),
      catalog: new CatalogController(catalogService),
    },
  });

  return { app, close: () => db.close() };
}
