import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Express } from 'express';
import { createApp } from './app.js';
import { appUrlOf, type Env } from './config/env.js';
import { SERVER_ROOT } from './config/paths.js';
import { AuthController } from './controllers/auth.controller.js';
import { CatalogController } from './controllers/catalog.controller.js';
import { ProfileController } from './controllers/profile.controller.js';
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
import { SqliteWeightLogRepository } from './repositories/sqlite/sqlite-weight-log.repository.js';
import { SqliteWorkoutDayRepository } from './repositories/sqlite/sqlite-workout-day.repository.js';
import { AccessGuard } from './services/access.guard.js';
import { AuthService } from './services/auth.service.js';
import { CatalogService } from './services/catalog.service.js';
import { DayExerciseService } from './services/day-exercise.service.js';
import { DnsEmailDomainChecker } from './services/email-domain.service.js';
import { BrevoEmailSender, ConsoleEmailSender, type EmailSender } from './services/email.service.js';
import { EmailVerificationService } from './services/verification.service.js';
import { PasswordService } from './services/password.service.js';
import { ProfileService } from './services/profile.service.js';
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
/** The built web, only in production and only if it was actually copied into the image. */
function resolvePublicDir(env: Env): string | null {
  if (env.NODE_ENV !== 'production') return null;
  const dir = resolve(SERVER_ROOT, env.PUBLIC_DIR);
  if (existsSync(resolve(dir, 'index.html'))) return dir;
  console.log(`No web build at ${dir}: serving the API only`);
  return null;
}

/** Brevo when configured; otherwise the confirmation links go to the log (development / Docker). */
function emailSenderFor(env: Env): EmailSender {
  if (env.BREVO_API_KEY) return new BrevoEmailSender(env.BREVO_API_KEY, env.EMAIL_FROM);
  if (env.NODE_ENV === 'production') console.warn('BREVO_API_KEY is not set: confirmation emails will only be logged');
  return new ConsoleEmailSender();
}

export function buildContainer(env: Env): Container {
  const databasePath = resolve(SERVER_ROOT, env.DATABASE_PATH);
  console.log(`SQLite database: ${databasePath}`); // On Railway it must be inside the volume (/app/data).
  const db = openDatabase(databasePath);
  const publicDir = resolvePublicDir(env);

  const access = new AccessGuard(new SqliteOwnershipRepository(db));
  const users = new SqliteUserRepository(db);
  const verification = new EmailVerificationService(users, emailSenderFor(env), appUrlOf(env));
  const authService = new AuthService(
    { users, passwords: new PasswordService(), tokens: new TokenService(env.JWT_SECRET), verification, emailDomains: new DnsEmailDomainChecker() },
    { allowRegistration: env.ALLOW_REGISTRATION, requireEmailVerification: env.REQUIRE_EMAIL_VERIFICATION },
  );
  const profileService = new ProfileService(users, new SqliteWeightLogRepository(db));
  const routineService = new RoutineService(new SqliteRoutineRepository(db), access);
  const dayService = new WorkoutDayService(new SqliteWorkoutDayRepository(db), access);
  const catalogService = new CatalogService(new SqliteCatalogRepository(db));
  const exerciseService = new DayExerciseService(new SqliteDayExerciseRepository(db), dayService, catalogService, access);
  const sessionService = new SessionService(new SqliteSessionRepository(db), dayService, access);

  const app = createApp({
    corsOrigin: env.CORS_ORIGIN,
    publicDir,
    isProduction: env.NODE_ENV === 'production',
    trustProxy: env.TRUST_PROXY,
    requireAuth: authenticate(authService),
    controllers: {
      // Same origin in production (CORS_ORIGIN unset) -> relative redirect after confirming.
      auth: new AuthController(authService, verification, env.CORS_ORIGIN ?? ''),
      routine: new RoutineController(routineService),
      workoutDay: new WorkoutDayController(dayService),
      dayExercise: new DayExerciseController(exerciseService),
      session: new SessionController(sessionService),
      catalog: new CatalogController(catalogService),
      profile: new ProfileController(profileService),
    },
  });

  return { app, close: () => db.close() };
}
