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

export class SqliteCatalogRepository implements CatalogRepository {
  private readonly stmt: {
    list: Statement<{ muscle: string | null }, CatalogRow>;
    findById: Statement<[string], CatalogRow>;
    insert: Statement<InsertParams>;
  };

  constructor(db: Database) {
    this.stmt = {
      list: db.prepare(`
        SELECT ${COLS} FROM exercise_catalog
        WHERE @muscle IS NULL OR muscle_group = @muscle
        ORDER BY name_normalized`),
      findById: db.prepare(`SELECT ${COLS} FROM exercise_catalog WHERE id = ?`),
      insert: db.prepare(`
        INSERT INTO exercise_catalog (id, name, name_normalized, muscle_group, equipment, is_custom, created_at)
        VALUES (@id, @name, @normalized, @muscle, @equipment, 1, @createdAt)`),
    };
  }

  async list(muscleGroup?: MuscleGroup): Promise<CatalogExercise[]> {
    return this.stmt.list.all({ muscle: muscleGroup ?? null }).map(toCatalogExercise);
  }

  async findById(id: string): Promise<CatalogExercise | null> {
    const row = this.stmt.findById.get(id);
    return row ? toCatalogExercise(row) : null;
  }

  async createCustom(input: CatalogExerciseInput, normalizedName: string): Promise<CatalogExercise | null> {
    const id = randomUUID();
    try {
      this.stmt.insert.run({
        id,
        name: input.name,
        normalized: normalizedName,
        muscle: input.muscleGroup,
        equipment: input.equipment ?? null,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      if (isUniqueViolation(error)) return null;
      throw error;
    }
    const created = await this.findById(id);
    if (!created) throw new Error(`Catalog exercise ${id} not found right after insert`);
    return created;
  }
}
