import type { WorkoutSession } from '@gym/shared';
import type { NewSessionRecord } from '../types/session.types.js';

/** Persistence contract for the workout history (logs). */
export interface SessionRepository {
  /** Saves the session and all its logged sets atomically. */
  create(record: NewSessionRecord): Promise<WorkoutSession>;
  /** Latest sessions of a day, newest first, each with its logged sets. */
  findByDay(dayId: string, limit: number): Promise<WorkoutSession[]>;
  delete(sessionId: string): Promise<boolean>;
}
