import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import {
  isEquipment,
  isMuscleGroup,
  type CatalogExercise,
  type CatalogExerciseInput,
  type MuscleGroup,
} from '@gym/shared';
import type { CatalogRepository } from '../catalog.repository.js';

interface CatalogRow {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string | null;
  is_custom: number;
}

interface InsertParams {
  id: string;
  userId: string;
  name: string;
  normalized: string;
  muscle: string;
  equipment: string | null;
  createdAt: string;
}

const COLS = 'id, name, muscle_group, equipment, is_custom';

/** The DB CHECK constraints guarantee valid values; this keeps the types honest. */
function toCatalogExercise(row: CatalogRow): CatalogExercise {
  if (!isMuscleGroup(row.muscle_group)) throw new Error(`Unknown muscle_group: ${row.muscle_group}`);
  const equipment = row.equipment !== null && isEquipment(row.equipment) ? row.equipment : null;
  return { id: row.id, name: row.name, muscleGroup: row.muscle_group, equipment, isCustom: row.is_custom === 1 };
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE';
}

/** Base entries plus the user's own custom ones. */
const VISIBLE = '(is_custom = 0 OR user_id = @userId)';

export class SqliteCatalogRepository implements CatalogRepository {
  private readonly stmt: {
    list: Statement<{ userId: string; muscle: string | null }, CatalogRow>;
    findVisible: Statement<{ userId: string; id: string }, CatalogRow>;
    insert: Statement<InsertParams>;
  };

  constructor(db: Database) {
    this.stmt = {
      list: db.prepare(`
        SELECT ${COLS} FROM exercise_catalog
        WHERE ${VISIBLE} AND (@muscle IS NULL OR muscle_group = @muscle)
        ORDER BY name_normalized`),
      findVisible: db.prepare(`SELECT ${COLS} FROM exercise_catalog WHERE id = @id AND ${VISIBLE}`),
      // Same name as a base exercise -> 0 rows (NOT EXISTS); same name as one of the user's
      // own -> UNIQUE (user_id, name_normalized). Both are atomic, no check-then-insert race.
      insert: db.prepare(`
        INSERT INTO exercise_catalog (id, name, name_normalized, muscle_group, equipment, is_custom, user_id, created_at)
        SELECT @id, @name, @normalized, @muscle, @equipment, 1, @userId, @createdAt
        WHERE NOT EXISTS (SELECT 1 FROM exercise_catalog WHERE is_custom = 0 AND name_normalized = @normalized)`),
    };
  }

  async list(userId: string, muscleGroup?: MuscleGroup): Promise<CatalogExercise[]> {
    return this.stmt.list.all({ userId, muscle: muscleGroup ?? null }).map(toCatalogExercise);
  }

  async findVisible(userId: string, id: string): Promise<CatalogExercise | null> {
    const row = this.stmt.findVisible.get({ userId, id });
    return row ? toCatalogExercise(row) : null;
  }

  async createCustom(userId: string, input: CatalogExerciseInput, normalizedName: string): Promise<CatalogExercise | null> {
    const id = randomUUID();
    try {
      const { changes } = this.stmt.insert.run({
        id,
        userId,
        name: input.name,
        normalized: normalizedName,
        muscle: input.muscleGroup,
        equipment: input.equipment ?? null,
        createdAt: new Date().toISOString(),
      });
      if (changes === 0) return null;
    } catch (error) {
      if (isUniqueViolation(error)) return null;
      throw error;
    }
    const created = await this.findVisible(userId, id);
    if (!created) throw new Error(`Catalog exercise ${id} not found right after insert`);
    return created;
  }
}
