import type { Database } from 'better-sqlite3';

// Frozen copy of SET_TYPES as of v2: an applied migration must never change.
// Adding a set type later requires a new migration that rebuilds the CHECK.
const SET_TYPE_CHECK = `'warmup', 'normal', 'topset', 'backoff', 'restpause', 'dropset'`;

/**
 * Ordered schema migrations. The database version is stored in
 * PRAGMA user_version; never edit an applied migration, append a new one.
 * Columns named `position` map to the domain field `order` (reserved word in SQL).
 */
type Migration =
  | string
  | { sql: string; disableForeignKeys: true }
  /** Code step, for changes that must inspect the current schema first. */
  | { run: (db: Database) => void };

/** Column names of a table, read with PRAGMA table_info (the table name is internal). */
function columnNames(db: Database, table: string): Set<string> {
  const rows: unknown = db.pragma(`table_info(${table})`);
  const names = new Set<string>();
  if (Array.isArray(rows)) {
    for (const row of rows) {
      if (typeof row === 'object' && row !== null && 'name' in row && typeof row.name === 'string') names.add(row.name);
    }
  }
  return names;
}

/**
 * v6 — body weight + preferred weight unit. Only ADD COLUMN (existing rows are kept,
 * weight_unit gets 'kg'), and each column is added only if PRAGMA table_info does not
 * list it yet, so the step is safe even on a database that already has them.
 * Limits are frozen copies (20-500, 'kg'/'lb'): an applied migration must never change.
 */
function addUserPreferences(db: Database): void {
  const existing = columnNames(db, 'users');
  if (!existing.has('body_weight')) {
    db.exec(`ALTER TABLE users ADD COLUMN body_weight REAL
      CHECK (body_weight IS NULL OR (body_weight >= 20 AND body_weight <= 500))`);
  }
  if (!existing.has('weight_unit')) {
    db.exec(`ALTER TABLE users ADD COLUMN weight_unit TEXT NOT NULL DEFAULT 'kg'
      CHECK (weight_unit IN ('kg', 'lb'))`);
  }
}

const MIGRATIONS: readonly Migration[] = [
  // v1 — flat model (Routine -> Exercise). Superseded by v2.
  `
  CREATE TABLE routines (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE exercises (
    id TEXT PRIMARY KEY,
    routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    name TEXT NOT NULL, sets INTEGER NOT NULL CHECK (sets > 0), reps TEXT NOT NULL,
    weight REAL CHECK (weight IS NULL OR weight >= 0),
    rest_seconds INTEGER CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
    notes TEXT, position INTEGER NOT NULL CHECK (position > 0)
  );
  CREATE INDEX idx_exercises_routine_position ON exercises (routine_id, position);
  `,
  // v2 — 4-level hierarchy + workout history. Starts from scratch (user decision):
  // the v1 data is dropped, not converted.
  `
  DROP TABLE IF EXISTS exercises;
  DROP TABLE IF EXISTS routines;

  CREATE TABLE routines (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE workout_days (
    id         TEXT PRIMARY KEY,
    routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    position   INTEGER NOT NULL CHECK (position > 0)
  );
  CREATE INDEX idx_workout_days_routine ON workout_days (routine_id, position);

  CREATE TABLE day_exercises (
    id             TEXT PRIMARY KEY,
    workout_day_id TEXT NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    notes          TEXT,
    position       INTEGER NOT NULL CHECK (position > 0)
  );
  CREATE INDEX idx_day_exercises_day ON day_exercises (workout_day_id, position);

  CREATE TABLE planned_sets (
    id              TEXT PRIMARY KEY,
    day_exercise_id TEXT NOT NULL REFERENCES day_exercises(id) ON DELETE CASCADE,
    set_number      INTEGER NOT NULL CHECK (set_number > 0),
    set_type        TEXT NOT NULL CHECK (set_type IN (${SET_TYPE_CHECK})),
    target_rep_min  INTEGER NOT NULL CHECK (target_rep_min > 0),
    target_rep_max  INTEGER NOT NULL,
    target_weight   REAL CHECK (target_weight IS NULL OR target_weight >= 0),
    target_rir      INTEGER CHECK (target_rir IS NULL OR target_rir >= 0),
    CHECK (target_rep_min <= target_rep_max),
    UNIQUE (day_exercise_id, set_number)
  );

  CREATE TABLE workout_sessions (
    id               TEXT PRIMARY KEY,
    workout_day_id   TEXT NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
    completed_at     TEXT NOT NULL,
    duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    notes            TEXT
  );
  CREATE INDEX idx_sessions_day_date ON workout_sessions (workout_day_id, completed_at DESC);

  CREATE TABLE logged_sets (
    id                TEXT PRIMARY KEY,
    session_id        TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    day_exercise_id   TEXT REFERENCES day_exercises(id) ON DELETE SET NULL,
    exercise_name     TEXT NOT NULL,
    exercise_position INTEGER NOT NULL,
    set_number        INTEGER NOT NULL CHECK (set_number > 0),
    set_type          TEXT NOT NULL CHECK (set_type IN (${SET_TYPE_CHECK})),
    actual_weight     REAL CHECK (actual_weight IS NULL OR actual_weight >= 0),
    actual_reps       INTEGER CHECK (actual_reps IS NULL OR actual_reps >= 0),
    completed         INTEGER NOT NULL CHECK (completed IN (0, 1))
  );
  CREATE INDEX idx_logged_sets_session ON logged_sets (session_id);
  `,
  // v3 — session lifecycle: exact start time and duration in seconds (computed by
  // the server). Existing minutes are converted; old sessions keep started_at NULL.
  `
  ALTER TABLE workout_sessions ADD COLUMN started_at TEXT;
  ALTER TABLE workout_sessions ADD COLUMN duration_seconds INTEGER
    CHECK (duration_seconds IS NULL OR duration_seconds >= 0);
  UPDATE workout_sessions SET duration_seconds = duration_minutes * 60
    WHERE duration_minutes IS NOT NULL;
  ALTER TABLE workout_sessions DROP COLUMN duration_minutes;
  `,
  // v4 — exercise catalog (base list + user exercises) and optional link from day exercises.
  // name_normalized (lowercase, no accents) gives accent/case-insensitive UNIQUE + search.
  `
  CREATE TABLE exercise_catalog (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    name_normalized TEXT NOT NULL UNIQUE,
    muscle_group    TEXT NOT NULL CHECK (muscle_group IN
                      ('Pecho', 'Espalda', 'Pierna', 'Hombro', 'Bíceps', 'Tríceps', 'Core', 'Cardio')),
    equipment       TEXT CHECK (equipment IS NULL OR equipment IN
                      ('Barra', 'Mancuernas', 'Polea', 'Máquina', 'Peso Corporal')),
    is_custom       INTEGER NOT NULL DEFAULT 0 CHECK (is_custom IN (0, 1)),
    created_at      TEXT NOT NULL
  );
  CREATE INDEX idx_exercise_catalog_muscle ON exercise_catalog (muscle_group);

  ALTER TABLE day_exercises ADD COLUMN catalog_exercise_id TEXT
    REFERENCES exercise_catalog(id) ON DELETE SET NULL;
  `,
  // v5 — users and ownership. Existing rows keep user_id NULL ("unclaimed") until the
  // first account is registered, which claims them (see the user repository).
  // The catalog is rebuilt (official 12-step procedure, FKs off) to replace the global
  // UNIQUE name by: base names unique, custom names unique per user.
  {
    disableForeignKeys: true,
    sql: `
  CREATE TABLE users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    created_at    TEXT NOT NULL
  );

  ALTER TABLE routines ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
  CREATE INDEX idx_routines_user ON routines (user_id, updated_at DESC);

  ALTER TABLE workout_sessions ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
  CREATE INDEX idx_sessions_user ON workout_sessions (user_id);

  CREATE TABLE exercise_catalog_v5 (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    name_normalized TEXT NOT NULL,
    muscle_group    TEXT NOT NULL CHECK (muscle_group IN
                      ('Pecho', 'Espalda', 'Pierna', 'Hombro', 'Bíceps', 'Tríceps', 'Core', 'Cardio')),
    equipment       TEXT CHECK (equipment IS NULL OR equipment IN
                      ('Barra', 'Mancuernas', 'Polea', 'Máquina', 'Peso Corporal')),
    is_custom       INTEGER NOT NULL DEFAULT 0 CHECK (is_custom IN (0, 1)),
    user_id         TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at      TEXT NOT NULL,
    CHECK (is_custom = 1 OR user_id IS NULL)
  );
  INSERT INTO exercise_catalog_v5 (id, name, name_normalized, muscle_group, equipment, is_custom, user_id, created_at)
    SELECT id, name, name_normalized, muscle_group, equipment, is_custom, NULL, created_at FROM exercise_catalog;
  DROP TABLE exercise_catalog;
  ALTER TABLE exercise_catalog_v5 RENAME TO exercise_catalog;
  CREATE INDEX idx_exercise_catalog_muscle ON exercise_catalog (muscle_group);
  CREATE UNIQUE INDEX ux_catalog_base_name ON exercise_catalog (name_normalized) WHERE is_custom = 0;
  CREATE UNIQUE INDEX ux_catalog_custom_name ON exercise_catalog (user_id, name_normalized) WHERE is_custom = 1;
  `,
  },
  { run: addUserPreferences },
];

function getSchemaVersion(db: Database): number {
  const version: unknown = db.pragma('user_version', { simple: true });
  return typeof version === 'number' ? version : 0;
}

/** Applies one migration and bumps user_version in the same transaction. */
function applyMigration(db: Database, step: (db: Database) => void, targetVersion: number): void {
  db.transaction(() => {
    step(db);
    const violations: unknown = db.pragma('foreign_key_check');
    if (Array.isArray(violations) && violations.length > 0) throw new Error(`Migration v${targetVersion} breaks foreign keys`);
    // PRAGMA does not accept bound parameters; targetVersion is an internal integer.
    db.pragma(`user_version = ${targetVersion}`);
  })();
}

export function runMigrations(db: Database): void {
  const currentVersion = getSchemaVersion(db);

  MIGRATIONS.forEach((migration, index) => {
    const targetVersion = index + 1;
    if (targetVersion <= currentVersion) return;
    const step = typeof migration === 'string' ? (d: Database) => d.exec(migration) : 'run' in migration ? migration.run : (d: Database) => d.exec(migration.sql);
    const disableForeignKeys = typeof migration !== 'string' && 'disableForeignKeys' in migration;

    // Table rebuilds need FKs off (outside the transaction, as SQLite requires);
    // otherwise dropping the old table would cascade into its children.
    if (disableForeignKeys) db.pragma('foreign_keys = OFF');
    try {
      applyMigration(db, step, targetVersion);
    } finally {
      if (disableForeignKeys) db.pragma('foreign_keys = ON');
    }
  });
}
