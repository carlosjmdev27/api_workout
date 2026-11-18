import type { Database, Statement } from 'better-sqlite3';
import type { ExerciseRepository } from '../exercise.repository.js';
import type { Exercise, ExerciseInput, ExerciseUpdate } from '../../types/exercise.types.js';
import {
  EXERCISE_COLUMNS,
  INSERT_EXERCISE_SQL,
  pick,
  toExercise,
  toNewExerciseParams,
  type ExerciseParams,
  type ExerciseRow,
} from './mappers.js';

interface ExerciseStatements {
  findByRoutine: Statement<[string], ExerciseRow>;
  findOne: Statement<[string, string], ExerciseRow>;
  nextPosition: Statement<[string], { next: number }>;
  insert: Statement<ExerciseParams>;
  update: Statement<ExerciseParams>;
  delete: Statement<[string, string]>;
  closeGap: Statement<[string, number]>;
  setPosition: Statement<[number, string, string]>;
  touchRoutine: Statement<[string, string]>;
}

/** SQLite implementation. Every write also refreshes the parent routine's updated_at. */
export class SqliteExerciseRepository implements ExerciseRepository {
  private readonly db: Database;
  private readonly stmt: ExerciseStatements;

  constructor(db: Database) {
    this.db = db;
    this.stmt = {
      findByRoutine: db.prepare(
        `SELECT ${EXERCISE_COLUMNS} FROM exercises WHERE routine_id = ? ORDER BY position`,
      ),
      findOne: db.prepare(
        `SELECT ${EXERCISE_COLUMNS} FROM exercises WHERE routine_id = ? AND id = ?`,
      ),
      nextPosition: db.prepare(
        'SELECT COALESCE(MAX(position), 0) + 1 AS next FROM exercises WHERE routine_id = ?',
      ),
      insert: db.prepare(INSERT_EXERCISE_SQL),
      update: db.prepare(`
        UPDATE exercises
        SET name = @name, sets = @sets, reps = @reps, weight = @weight,
            rest_seconds = @restSeconds, notes = @notes, position = @position
        WHERE id = @id AND routine_id = @routineId`),
      delete: db.prepare('DELETE FROM exercises WHERE routine_id = ? AND id = ?'),
      closeGap: db.prepare(
        'UPDATE exercises SET position = position - 1 WHERE routine_id = ? AND position > ?',
      ),
      setPosition: db.prepare(
        'UPDATE exercises SET position = ? WHERE routine_id = ? AND id = ?',
      ),
      touchRoutine: db.prepare('UPDATE routines SET updated_at = ? WHERE id = ?'),
    };
  }

  async findByRoutineId(routineId: string): Promise<Exercise[]> {
    return this.listSync(routineId);
  }

  async create(routineId: string, input: ExerciseInput): Promise<Exercise> {
    return this.db.transaction((): Exercise => {
      const position = this.stmt.nextPosition.get(routineId)?.next ?? 1;
      const params = toNewExerciseParams(routineId, input, position);
      this.stmt.insert.run(params);
      this.touch(routineId);
      return this.getSync(routineId, params.id);
    })();
  }

  async update(
    routineId: string,
    exerciseId: string,
    input: ExerciseUpdate,
  ): Promise<Exercise | null> {
    return this.db.transaction((): Exercise | null => {
      const current = this.stmt.findOne.get(routineId, exerciseId);
      if (!current) return null;

      this.stmt.update.run({
        id: exerciseId,
        routineId,
        name: pick(input.name, current.name),
        sets: pick(input.sets, current.sets),
        reps: pick(input.reps, current.reps),
        weight: pick(input.weight, current.weight),
        restSeconds: pick(input.restSeconds, current.rest_seconds),
        notes: pick(input.notes, current.notes),
        position: current.position,
      });
      this.touch(routineId);
      return this.getSync(routineId, exerciseId);
    })();
  }

  async delete(routineId: string, exerciseId: string): Promise<boolean> {
    return this.db.transaction((): boolean => {
      const current = this.stmt.findOne.get(routineId, exerciseId);
      if (!current) return false;

      this.stmt.delete.run(routineId, exerciseId);
      this.stmt.closeGap.run(routineId, current.position);
      this.touch(routineId);
      return true;
    })();
  }

  async reorder(routineId: string, orderedIds: readonly string[]): Promise<Exercise[]> {
    return this.db.transaction((): Exercise[] => {
      orderedIds.forEach((exerciseId, index) => {
        this.stmt.setPosition.run(index + 1, routineId, exerciseId);
      });
      this.touch(routineId);
      return this.listSync(routineId);
    })();
  }

  private listSync(routineId: string): Exercise[] {
    return this.stmt.findByRoutine.all(routineId).map(toExercise);
  }

  private getSync(routineId: string, exerciseId: string): Exercise {
    const row = this.stmt.findOne.get(routineId, exerciseId);
    if (!row) throw new Error(`Exercise ${exerciseId} not found inside its own transaction`);
    return toExercise(row);
  }

  private touch(routineId: string): void {
    this.stmt.touchRoutine.run(new Date().toISOString(), routineId);
  }
}
