import type { Database } from 'better-sqlite3';

/**
 * Ordered schema migrations. The database version is stored in
 * PRAGMA user_version; never edit an applied migration, append a new one.
 * The column `position` maps to the domain field `order` (reserved word in SQL).
 */
const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE routines (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE exercises (
    id           TEXT PRIMARY KEY,
    routine_id   TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    sets         INTEGER NOT NULL CHECK (sets > 0),
    reps         TEXT NOT NULL,
    weight       REAL CHECK (weight IS NULL OR weight >= 0),
    rest_seconds INTEGER CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
    notes        TEXT,
    position     INTEGER NOT NULL CHECK (position > 0)
  );

  CREATE INDEX idx_exercises_routine_position ON exercises (routine_id, position);
  `,
];

function getSchemaVersion(db: Database): number {
  const version: unknown = db.pragma('user_version', { simple: true });
  return typeof version === 'number' ? version : 0;
}

export function runMigrations(db: Database): void {
  const currentVersion = getSchemaVersion(db);

  MIGRATIONS.forEach((sql, index) => {
    const targetVersion = index + 1;
    if (targetVersion <= currentVersion) return;

    db.transaction(() => {
      db.exec(sql);
      // PRAGMA does not accept bound parameters; targetVersion is an internal integer.
      db.pragma(`user_version = ${targetVersion}`);
    })();
  });
}
