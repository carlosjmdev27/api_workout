import type { Database } from 'better-sqlite3';

// Frozen copy of SET_TYPES as of v2: an applied migration must never change.
// Adding a set type later requires a new migration that rebuilds the CHECK.
const SET_TYPE_CHECK = `'warmup', 'normal', 'topset', 'backoff', 'restpause', 'dropset'`;

/**
 * Ordered schema migrations. The database version is stored in
 * PRAGMA user_version; never edit an applied migration, append a new one.
 * Columns named `position` map to the domain field `order` (reserved word in SQL).
 */
const MIGRATIONS: readonly string[] = [
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
