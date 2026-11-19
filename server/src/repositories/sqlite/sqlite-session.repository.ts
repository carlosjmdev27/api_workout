import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import type { WorkoutSession, WorkoutSessionDetail } from '@gym/shared';
import type { NewSessionRecord } from '../../types/session.types.js';
import type { SessionRepository } from '../session.repository.js';
import { groupBy, toLoggedSet, toSession, type LoggedSetRow, type SessionRow } from './rows.js';

const SESSION_COLS = 'id, workout_day_id, started_at, completed_at, duration_seconds, notes';
const LOGGED_COLS = `id, session_id, day_exercise_id, exercise_name, exercise_position,
  set_number, set_type, actual_weight, actual_reps, completed`;

interface SessionParams {
  id: string;
  dayId: string;
  startedAt: string;
  completedAt: string;
  duration: number;
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
  reps: number;
}

interface SessionDetailRow extends SessionRow {
  day_name: string;
  routine_id: string;
  routine_name: string;
}

interface SessionStatements {
  insertSession: Statement<SessionParams>;
  insertSet: Statement<LoggedSetParams>;
  findDetail: Statement<[string], SessionDetailRow>;
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
        VALUES (@id, @dayId, @startedAt, @completedAt, @duration, @notes)`),
      // Only completed sets are recorded since v3 (completed = 1).
      insertSet: db.prepare(`
        INSERT INTO logged_sets (${LOGGED_COLS})
        VALUES (@id, @sessionId, @exerciseId, @exerciseName, @exerciseOrder,
                @setNumber, @setType, @weight, @reps, 1)`),
      findDetail: db.prepare(`
        SELECT s.id, s.workout_day_id, s.started_at, s.completed_at, s.duration_seconds, s.notes,
               d.name AS day_name, r.id AS routine_id, r.name AS routine_name
        FROM workout_sessions s
        JOIN workout_days d ON d.id = s.workout_day_id
        JOIN routines r ON r.id = d.routine_id
        WHERE s.id = ?`),
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
        startedAt: record.startedAt,
        completedAt: record.completedAt,
        duration: record.durationSeconds,
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
        }),
      );
    })();

    const created = await this.findById(id);
    if (!created) throw new Error(`Session ${id} not found right after insert`);
    return created;
  }

  async findById(sessionId: string): Promise<WorkoutSessionDetail | null> {
    const row = this.stmt.findDetail.get(sessionId);
    if (!row) return null;
    return {
      ...toSession(row, this.stmt.setsBySession.all(sessionId).map(toLoggedSet)),
      dayName: row.day_name,
      routineId: row.routine_id,
      routineName: row.routine_name,
    };
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
