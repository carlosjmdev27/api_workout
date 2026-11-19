import { LIMITS, type DayExercise, type SessionInput, type WorkoutSession } from '@gym/shared';
import { BusinessRuleError } from '../errors/app-error.js';
import type { SessionRepository } from '../repositories/session.repository.js';
import type { NewLoggedSetRecord, NewSessionRecord } from '../types/session.types.js';
import { sessionNotFound } from './errors.js';
import type { WorkoutDayService } from './workout-day.service.js';

/** Tolerance for clock differences between the device and the server. */
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

/** Business logic for the workout history (executed sessions). */
export class SessionService {
  private readonly sessions: SessionRepository;
  private readonly days: WorkoutDayService;

  constructor(sessions: SessionRepository, days: WorkoutDayService) {
    this.sessions = sessions;
    this.days = days;
  }

  async create(input: SessionInput): Promise<WorkoutSession> {
    const day = await this.days.getById(input.workoutDayId);
    const completedAt = this.resolveCompletedAt(input.completedAt);
    const exercisesById = new Map(day.exercises.map((exercise) => [exercise.id, exercise]));

    const record: NewSessionRecord = {
      workoutDayId: day.id,
      completedAt,
      durationMinutes: input.durationMinutes ?? null,
      notes: input.notes ?? null,
      sets: input.sets.map((set) => this.toRecord(set, exercisesById)),
    };
    return this.sessions.create(record);
  }

  async historyByDay(dayId: string): Promise<WorkoutSession[]> {
    await this.days.getById(dayId);
    return this.sessions.findByDay(dayId, LIMITS.HISTORY_SESSIONS_MAX);
  }

  async delete(sessionId: string): Promise<void> {
    if (!(await this.sessions.delete(sessionId))) throw sessionNotFound(sessionId);
  }

  private resolveCompletedAt(completedAt: string | undefined): string {
    if (completedAt === undefined) return new Date().toISOString();
    if (Date.parse(completedAt) > Date.now() + FUTURE_TOLERANCE_MS) {
      throw new BusinessRuleError('INVALID_SESSION_DATE', 'completedAt cannot be in the future');
    }
    return completedAt;
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
      actualReps: set.actualReps ?? null,
      completed: set.completed,
    };
  }
}
