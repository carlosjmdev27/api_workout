import {
  LIMITS,
  type DayExercise,
  type SessionInput,
  type WorkoutSession,
  type WorkoutSessionDetail,
} from '@gym/shared';
import { BusinessRuleError } from '../errors/app-error.js';
import type { SessionRepository } from '../repositories/session.repository.js';
import type { NewLoggedSetRecord } from '../types/session.types.js';
import type { AccessGuard } from './access.guard.js';
import { sessionNotFound } from './errors.js';
import type { WorkoutDayService } from './workout-day.service.js';

/** Tolerance for clock differences between the device and the server. */
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

/** Business logic for the workout history (executed sessions). Every call is scoped to a user. */
export class SessionService {
  private readonly sessions: SessionRepository;
  private readonly days: WorkoutDayService;
  private readonly access: AccessGuard;

  constructor(sessions: SessionRepository, days: WorkoutDayService, access: AccessGuard) {
    this.sessions = sessions;
    this.days = days;
    this.access = access;
  }

  async create(userId: string, input: SessionInput): Promise<WorkoutSession> {
    const day = await this.days.getById(userId, input.workoutDayId); // Also checks ownership.
    const durationSeconds = this.computeDuration(input.startedAt, input.completedAt);
    const exercisesById = new Map(day.exercises.map((exercise) => [exercise.id, exercise]));

    return this.sessions.create({
      userId,
      workoutDayId: day.id,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      durationSeconds,
      notes: input.notes ?? null,
      sets: input.sets.map((set) => this.toRecord(set, exercisesById)),
    });
  }

  async getById(userId: string, sessionId: string): Promise<WorkoutSessionDetail> {
    await this.access.assertSession(userId, sessionId);
    const session = await this.sessions.findById(sessionId);
    if (!session) throw sessionNotFound(sessionId);
    return session;
  }

  async historyByDay(userId: string, dayId: string): Promise<WorkoutSession[]> {
    await this.access.assertDay(userId, dayId);
    return this.sessions.findByDay(dayId, LIMITS.HISTORY_SESSIONS_MAX);
  }

  async delete(userId: string, sessionId: string): Promise<void> {
    await this.access.assertSession(userId, sessionId);
    if (!(await this.sessions.delete(sessionId))) throw sessionNotFound(sessionId);
  }

  /** Single source of truth for the duration: the two timestamps (order already checked by Zod). */
  private computeDuration(startedAt: string, completedAt: string): number {
    if (Date.parse(completedAt) > Date.now() + FUTURE_TOLERANCE_MS) {
      throw new BusinessRuleError('INVALID_SESSION_DATE', 'completedAt cannot be in the future');
    }
    const seconds = Math.floor((Date.parse(completedAt) - Date.parse(startedAt)) / 1000);
    if (seconds > LIMITS.SESSION_DURATION_MAX_SECONDS) {
      throw new BusinessRuleError(
        'INVALID_SESSION_DURATION',
        `A session cannot last more than ${LIMITS.SESSION_DURATION_MAX_SECONDS / 3600} hours`,
      );
    }
    return seconds;
  }

  /** Each logged set must belong to an exercise of this day; snapshots its name/order. */
  private toRecord(
    set: SessionInput['sets'][number],
    exercisesById: ReadonlyMap<string, DayExercise>,
  ): NewLoggedSetRecord {
    const exercise = exercisesById.get(set.dayExerciseId);
    if (!exercise) {
      throw new BusinessRuleError(
        'INVALID_SESSION_EXERCISE',
        `Exercise ${set.dayExerciseId} does not belong to this workout day`,
      );
    }
    return {
      dayExerciseId: exercise.id,
      exerciseName: exercise.name,
      exerciseOrder: exercise.order,
      setNumber: set.setNumber,
      setType: set.setType,
      actualWeight: set.actualWeight ?? null,
      actualReps: set.actualReps,
    };
  }
}
