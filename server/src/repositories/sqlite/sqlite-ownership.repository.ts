import type { Database, Statement } from 'better-sqlite3';
import type { Owner, OwnershipRepository } from '../ownership.repository.js';

type OwnerStatement = Statement<[string], { user_id: string | null }>;

/** Days and exercises have no user_id: ownership always comes from their routine. */
export class SqliteOwnershipRepository implements OwnershipRepository {
  private readonly stmt: Record<'routine' | 'day' | 'exercise' | 'session', OwnerStatement>;

  constructor(db: Database) {
    this.stmt = {
      routine: db.prepare('SELECT user_id FROM routines WHERE id = ?'),
      day: db.prepare(`
        SELECT r.user_id FROM workout_days d
        JOIN routines r ON r.id = d.routine_id
        WHERE d.id = ?`),
      exercise: db.prepare(`
        SELECT r.user_id FROM day_exercises e
        JOIN workout_days d ON d.id = e.workout_day_id
        JOIN routines r ON r.id = d.routine_id
        WHERE e.id = ?`),
      session: db.prepare('SELECT user_id FROM workout_sessions WHERE id = ?'),
    };
  }

  async routineOwner(routineId: string): Promise<Owner> {
    return this.stmt.routine.get(routineId)?.user_id;
  }

  async dayOwner(dayId: string): Promise<Owner> {
    return this.stmt.day.get(dayId)?.user_id;
  }

  async exerciseOwner(exerciseId: string): Promise<Owner> {
    return this.stmt.exercise.get(exerciseId)?.user_id;
  }

  async sessionOwner(sessionId: string): Promise<Owner> {
    return this.stmt.session.get(sessionId)?.user_id;
  }
}
