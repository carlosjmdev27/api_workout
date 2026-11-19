import { randomUUID } from 'node:crypto';
import type { Database } from 'better-sqlite3';
import { MUSCLE_GROUPS, normalizeSearch } from '@gym/shared';
import { BASE_CATALOG } from './exercise-catalog.data.js';

interface SeedParams {
  id: string;
  name: string;
  normalized: string;
  muscle: string;
  equipment: string | null;
  createdAt: string;
}

/**
 * Idempotent: inserts the base exercises that are missing (matched by normalized
 * name), in one transaction. Safe to run on every start; never touches custom
 * exercises nor base ones already present. Returns how many were inserted.
 */
export function seedExerciseCatalog(db: Database): number {
  const insert = db.prepare<SeedParams>(`
    INSERT OR IGNORE INTO exercise_catalog (id, name, name_normalized, muscle_group, equipment, is_custom, created_at)
    VALUES (@id, @name, @normalized, @muscle, @equipment, 0, @createdAt)`);
  const createdAt = new Date().toISOString();

  return db.transaction((): number =>
    MUSCLE_GROUPS.reduce((inserted, muscle) =>
      inserted + BASE_CATALOG[muscle].reduce((count, [name, equipment]) =>
        count + insert.run({ id: randomUUID(), name, normalized: normalizeSearch(name), muscle, equipment, createdAt }).changes,
      0),
    0),
  )();
}
