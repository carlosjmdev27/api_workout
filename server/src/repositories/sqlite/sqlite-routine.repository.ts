import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import type {
  Routine,
  RoutineDetail,
  RoutineInput,
  RoutineSummary,
  RoutineUpdate,
} from '@gym/shared';
import type { RoutineRepository } from '../routine.repository.js';
import { toRoutine, toRoutineSummary, type RoutineRow, type RoutineSummaryRow } from './rows.js';
import { TreeReader } from './tree-reader.js';

const ROUTINE_COLUMNS = 'id, name, description, created_at, updated_at';

interface RoutineWriteParams {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

interface RoutineStatements {
  findAll: Statement<[], RoutineSummaryRow>;
  findById: Statement<[string], RoutineRow>;
  insert: Statement<RoutineWriteParams & { createdAt: string }>;
  update: Statement<RoutineWriteParams>;
  delete: Statement<[string]>;
}

/** SQLite implementation. All SQL uses bound parameters (no string concatenation of input). */
export class SqliteRoutineRepository implements RoutineRepository {
  private readonly db: Database;
  private readonly stmt: RoutineStatements;
  private readonly tree: TreeReader;

  constructor(db: Database) {
    this.db = db;
    this.tree = new TreeReader(db);
    this.stmt = {
      findAll: db.prepare(`
        SELECT r.id, r.name, r.description, r.created_at, r.updated_at,
               COUNT(d.id) AS day_count
        FROM routines r
        LEFT JOIN workout_days d ON d.routine_id = r.id
        GROUP BY r.id
        ORDER BY r.updated_at DESC`),
      findById: db.prepare(`SELECT ${ROUTINE_COLUMNS} FROM routines WHERE id = ?`),
      insert: db.prepare(`
        INSERT INTO routines (${ROUTINE_COLUMNS})
        VALUES (@id, @name, @description, @createdAt, @updatedAt)`),
      update: db.prepare(`
        UPDATE routines SET name = @name, description = @description, updated_at = @updatedAt
        WHERE id = @id`),
      // ON DELETE CASCADE removes days, exercises, sets, sessions and logged sets.
      delete: db.prepare('DELETE FROM routines WHERE id = ?'),
    };
  }

  async findAll(): Promise<RoutineSummary[]> {
    return this.stmt.findAll.all().map(toRoutineSummary);
  }

  async findById(id: string): Promise<RoutineDetail | null> {
    return this.findDetail(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.stmt.findById.get(id) !== undefined;
  }

  async create(input: RoutineInput): Promise<RoutineDetail> {
    const id = randomUUID();
    const now = new Date().toISOString();
    this.stmt.insert.run({
      id,
      name: input.name,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
    });
    const created = this.findDetail(id);
    if (!created) throw new Error(`Routine ${id} not found right after insert`);
    return created;
  }

  async update(id: string, input: RoutineUpdate): Promise<Routine | null> {
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
    // One statement + FK cascades: SQLite runs it atomically.
    return this.db.transaction((): boolean => this.stmt.delete.run(id).changes > 0)();
  }

  private findDetail(id: string): RoutineDetail | null {
    const row = this.stmt.findById.get(id);
    if (!row) return null;
    return { ...toRoutine(row), days: this.tree.daysOfRoutine(id) };
  }
}
