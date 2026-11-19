import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import type { WorkoutSession } from '@gym/shared';
import type { NewSessionRecord } from '../../types/session.types.js';
import type { SessionRepository } from '../session.repository.js';
import { groupBy, toLoggedSet, toSession, type LoggedSetRow, type SessionRow } from './rows.js';

const SESSION_COLS = 'id, workout_day_id, completed_at, duration_minutes, notes';
const LOGGED_COLS = `id, session_id, day_exercise_id, exercise_name, exercise_position,
  set_number, set_type, actual_weight, actual_reps, completed`;

interface SessionParams {
  id: string;
  dayId: string;
  completedAt: string;
  duration: number | null;
  notes: string | null;
}

interface LoggedSetParams {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  exerciseOrder: number;
  setNumber: number;
  setType: string;
  weight: number | null;
  reps: number | null;
  completed: number;
}

interface SessionStatements {
  insertSession: Statement<SessionParams>;
  insertSet: Statement<LoggedSetParams>;
  findById: Statement<[string], SessionRow>;
  setsBySession: Statement<[string], LoggedSetRow>;
  findByDay: Statement<[string, number], SessionRow>;
  setsByDay: Statement<[string, number], LoggedSetRow>;
  delete: Statement<[string]>;
}

export class SqliteSessionRepository implements SessionRepository {
  private readonly db: Database;
  private readonly stmt: SessionStatements;

  constructor(db: Database) {
    this.db = db;
    const latestIds = `SELECT id FROM workout_sessions WHERE workout_day_id = ? ORDER BY completed_at DESC LIMIT ?`;
    this.stmt = {
      insertSession: db.prepare(`
        INSERT INTO workout_sessions (${SESSION_COLS})
        VALUES (@id, @dayId, @completedAt, @duration, @notes)`),
      insertSet: db.prepare(`
        INSERT INTO logged_sets (${LOGGED_COLS})
        VALUES (@id, @sessionId, @exerciseId, @exerciseName, @exerciseOrder,
                @setNumber, @setType, @weight, @reps, @completed)`),
      findById: db.prepare(`SELECT ${SESSION_COLS} FROM workout_sessions WHERE id = ?`),
      setsBySession: db.prepare(
        `SELECT ${LOGGED_COLS} FROM logged_sets WHERE session_id = ? ORDER BY exercise_position, set_number`,
      ),
      findByDay: db.prepare(
        `SELECT ${SESSION_COLS} FROM workout_sessions WHERE workout_day_id = ? ORDER BY completed_at DESC LIMIT ?`,
      ),
      setsByDay: db.prepare(`
        SELECT ${LOGGED_COLS} FROM logged_sets WHERE session_id IN (${latestIds})
        ORDER BY exercise_position, set_number`),
      delete: db.prepare('DELETE FROM workout_sessions WHERE id = ?'),
    };
  }

  async create(record: NewSessionRecord): Promise<WorkoutSession> {
    const id = randomUUID();
    this.db.transaction(() => {
      this.stmt.insertSession.run({
        id,
        dayId: record.workoutDayId,
        completedAt: record.completedAt,
        duration: record.durationMinutes,
        notes: record.notes,
      });
      record.sets.forEach((set) =>
        this.stmt.insertSet.run({
          id: randomUUID(),
          sessionId: id,
          exerciseId: set.dayExerciseId,
          exerciseName: set.exerciseName,
          exerciseOrder: set.exerciseOrder,
          setNumber: set.setNumber,
          setType: set.setType,
          weight: set.actualWeight,
          reps: set.actualReps,
          completed: set.completed ? 1 : 0,
        }),
      );
    })();

    const row = this.stmt.findById.get(id);
    if (!row) throw new Error(`Session ${id} not found right after insert`);
    return toSession(row, this.stmt.setsBySession.all(id).map(toLoggedSet));
  }

  async findByDay(dayId: string, limit: number): Promise<WorkoutSession[]> {
    const sessions = this.stmt.findByDay.all(dayId, limit);
    const setsBySession = groupBy(this.stmt.setsByDay.all(dayId, limit), (set) => set.session_id);
    return sessions.map((row) => toSession(row, (setsBySession.get(row.id) ?? []).map(toLoggedSet)));
  }

  async delete(sessionId: string): Promise<boolean> {
    return this.db.transaction((): boolean => this.stmt.delete.run(sessionId).changes > 0)();
  }
}
