import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import type { RoutineRepository } from '../routine.repository.js';
import type {
  CreateRoutineInput,
  Routine,
  RoutineSummary,
  RoutineWithExercises,
  UpdateRoutineInput,
} from '../../types/routine.types.js';
import {
  EXERCISE_COLUMNS,
  INSERT_EXERCISE_SQL,
  ROUTINE_COLUMNS,
  toExercise,
  toNewExerciseParams,
  toRoutine,
  toRoutineSummary,
  type ExerciseParams,
  type ExerciseRow,
  type RoutineRow,
  type RoutineSummaryRow,
} from './mappers.js';

interface RoutineWriteParams {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

interface RoutineStatements {
  findAll: Statement<[], RoutineSummaryRow>;
  findById: Statement<[string], RoutineRow>;
  findExercises: Statement<[string], ExerciseRow>;
  insert: Statement<RoutineWriteParams & { createdAt: string }>;
  insertExercise: Statement<ExerciseParams>;
  update: Statement<RoutineWriteParams>;
  deleteExercises: Statement<[string]>;
  delete: Statement<[string]>;
}

/** SQLite implementation. All SQL uses bound parameters (no string concatenation of input). */
export class SqliteRoutineRepository implements RoutineRepository {
  private readonly db: Database;
  private readonly stmt: RoutineStatements;

  constructor(db: Database) {
    this.db = db;
    this.stmt = {
      findAll: db.prepare(`
        SELECT r.id, r.name, r.description, r.created_at, r.updated_at,
               COUNT(e.id) AS exercise_count
        FROM routines r
        LEFT JOIN exercises e ON e.routine_id = r.id
        GROUP BY r.id
        ORDER BY r.updated_at DESC`),
      findById: db.prepare(`SELECT ${ROUTINE_COLUMNS} FROM routines WHERE id = ?`),
      findExercises: db.prepare(
        `SELECT ${EXERCISE_COLUMNS} FROM exercises WHERE routine_id = ? ORDER BY position`,
      ),
      insert: db.prepare(`
        INSERT INTO routines (${ROUTINE_COLUMNS})
        VALUES (@id, @name, @description, @createdAt, @updatedAt)`),
      insertExercise: db.prepare(INSERT_EXERCISE_SQL),
      update: db.prepare(`
        UPDATE routines SET name = @name, description = @description, updated_at = @updatedAt
        WHERE id = @id`),
      deleteExercises: db.prepare('DELETE FROM exercises WHERE routine_id = ?'),
      delete: db.prepare('DELETE FROM routines WHERE id = ?'),
    };
  }

  async findAll(): Promise<RoutineSummary[]> {
    return this.stmt.findAll.all().map(toRoutineSummary);
  }

  async findById(id: string): Promise<RoutineWithExercises | null> {
    return this.findWithExercises(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.stmt.findById.get(id) !== undefined;
  }

  async create(input: CreateRoutineInput): Promise<RoutineWithExercises> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.db.transaction(() => {
      this.stmt.insert.run({
        id,
        name: input.name,
        description: input.description ?? null,
        createdAt: now,
        updatedAt: now,
      });
      (input.exercises ?? []).forEach((exercise, index) => {
        this.stmt.insertExercise.run(toNewExerciseParams(id, exercise, index + 1));
      });
    })();

    const created = this.findWithExercises(id);
    if (!created) throw new Error(`Routine ${id} not found right after insert`);
    return created;
  }

  async update(id: string, input: UpdateRoutineInput): Promise<Routine | null> {
    return this.db.transaction((): Routine | null => {
      const current = this.stmt.findById.get(id);
      if (!current) return null;

      const params: RoutineWriteParams = {
        id,
        name: input.name ?? current.name,
        description: input.description === undefined ? current.description : input.description,
        updatedAt: new Date().toISOString(),
      };
      this.stmt.update.run(params);

      return toRoutine({ ...current, ...params, updated_at: params.updatedAt });
    })();
  }

  async delete(id: string): Promise<boolean> {
    // Explicit child delete (besides ON DELETE CASCADE) keeps this portable to any engine.
    return this.db.transaction((): boolean => {
      this.stmt.deleteExercises.run(id);
      return this.stmt.delete.run(id).changes > 0;
    })();
  }

  private findWithExercises(id: string): RoutineWithExercises | null {
    const row = this.stmt.findById.get(id);
    if (!row) return null;
    return { ...toRoutine(row), exercises: this.stmt.findExercises.all(id).map(toExercise) };
  }
}
