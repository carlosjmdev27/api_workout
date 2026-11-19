import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import type { WorkoutDay, WorkoutDayDetail, WorkoutDayInput } from '@gym/shared';
import type { WorkoutDayRepository } from '../workout-day.repository.js';
import { RoutineToucher } from './routine-toucher.js';
import type { DayRow } from './rows.js';
import { TreeReader } from './tree-reader.js';

interface DayInsertParams {
  id: string;
  routineId: string;
  name: string;
  position: number;
}

interface DayStatements {
  findRow: Statement<[string], DayRow>;
  routineName: Statement<[string], { name: string }>;
  nextPosition: Statement<[string], { next: number }>;
  insert: Statement<DayInsertParams>;
  rename: Statement<[string, string]>;
  delete: Statement<[string]>;
  closeGap: Statement<[string, number]>;
  setPosition: Statement<[number, string, string]>;
}

export class SqliteWorkoutDayRepository implements WorkoutDayRepository {
  private readonly db: Database;
  private readonly stmt: DayStatements;
  private readonly tree: TreeReader;
  private readonly touch: RoutineToucher;

  constructor(db: Database) {
    this.db = db;
    this.tree = new TreeReader(db);
    this.touch = new RoutineToucher(db);
    this.stmt = {
      findRow: db.prepare('SELECT id, routine_id, name, position FROM workout_days WHERE id = ?'),
      routineName: db.prepare('SELECT name FROM routines WHERE id = ?'),
      nextPosition: db.prepare(
        'SELECT COALESCE(MAX(position), 0) + 1 AS next FROM workout_days WHERE routine_id = ?',
      ),
      insert: db.prepare(`
        INSERT INTO workout_days (id, routine_id, name, position)
        VALUES (@id, @routineId, @name, @position)`),
      rename: db.prepare('UPDATE workout_days SET name = ? WHERE id = ?'),
      delete: db.prepare('DELETE FROM workout_days WHERE id = ?'),
      closeGap: db.prepare(
        'UPDATE workout_days SET position = position - 1 WHERE routine_id = ? AND position > ?',
      ),
      setPosition: db.prepare('UPDATE workout_days SET position = ? WHERE routine_id = ? AND id = ?'),
    };
  }

  async findByRoutine(routineId: string): Promise<WorkoutDay[]> {
    return this.tree.daysOfRoutine(routineId);
  }

  async findById(dayId: string): Promise<WorkoutDayDetail | null> {
    const day = this.tree.day(dayId);
    if (!day) return null;
    const routine = this.stmt.routineName.get(day.routineId);
    return { ...day, routineName: routine?.name ?? '' };
  }

  async create(routineId: string, input: WorkoutDayInput): Promise<WorkoutDay> {
    return this.db.transaction((): WorkoutDay => {
      const id = randomUUID();
      const position = this.stmt.nextPosition.get(routineId)?.next ?? 1;
      this.stmt.insert.run({ id, routineId, name: input.name, position });
      this.touch.routine(routineId);
      return this.getDay(id);
    })();
  }

  async rename(dayId: string, input: WorkoutDayInput): Promise<WorkoutDay | null> {
    return this.db.transaction((): WorkoutDay | null => {
      if (this.stmt.rename.run(input.name, dayId).changes === 0) return null;
      this.touch.day(dayId);
      return this.getDay(dayId);
    })();
  }

  async delete(dayId: string): Promise<boolean> {
    return this.db.transaction((): boolean => {
      const current = this.stmt.findRow.get(dayId);
      if (!current) return false;
      this.stmt.delete.run(dayId); // Cascades to exercises, sets and the day's history.
      this.stmt.closeGap.run(current.routine_id, current.position);
      this.touch.routine(current.routine_id);
      return true;
    })();
  }

  async reorder(routineId: string, orderedIds: readonly string[]): Promise<WorkoutDay[]> {
    return this.db.transaction((): WorkoutDay[] => {
      orderedIds.forEach((dayId, index) => this.stmt.setPosition.run(index + 1, routineId, dayId));
      this.touch.routine(routineId);
      return this.tree.daysOfRoutine(routineId);
    })();
  }

  private getDay(dayId: string): WorkoutDay {
    const day = this.tree.day(dayId);
    if (!day) throw new Error(`Workout day ${dayId} not found inside its own transaction`);
    return day;
  }
}
