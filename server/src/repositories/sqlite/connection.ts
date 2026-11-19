import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import BetterSqlite3, { type Database } from 'better-sqlite3';
import { runMigrations } from './migrations.js';
import { seedExerciseCatalog } from './seed/seedExercises.js';

/** Opens (or creates) the SQLite file, applies pragmas, migrations and the base catalog seed. */
export function openDatabase(filePath: string): Database {
  mkdirSync(dirname(filePath), { recursive: true });

  const db = new BetterSqlite3(filePath);
  db.pragma('journal_mode = WAL'); // Better concurrency between reads and writes.
  db.pragma('foreign_keys = ON'); // SQLite disables FK checks by default.
  db.pragma('busy_timeout = 5000');

  runMigrations(db);
  seedExerciseCatalog(db); // Idempotent: only inserts missing base exercises.
  return db;
}
