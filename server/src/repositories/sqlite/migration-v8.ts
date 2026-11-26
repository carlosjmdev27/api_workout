import { randomUUID } from 'node:crypto';
import type { Database } from 'better-sqlite3';
import { columnNames } from './schema-info.js';

/**
 * v8 — richer profile + body weight history.
 * - users: last_name, country, birth_date, height_cm. ADD COLUMN only, each one only if
 *   PRAGMA table_info does not list it yet. Existing rows keep NULL (nothing to invent).
 * - body_weight_logs (CREATE IF NOT EXISTS) with FK -> users ON DELETE CASCADE.
 * - Users who already had users.body_weight get it as their first log (unit = their
 *   current weight_unit, date = now), only if they have no log yet: re-running never
 *   duplicates it.
 * Limits are frozen copies (height 50-280, weight 20-500, 'kg'/'lb').
 */
export function addProfileAndWeightLogs(db: Database): void {
  const existing = columnNames(db, 'users');
  if (!existing.has('last_name')) db.exec('ALTER TABLE users ADD COLUMN last_name TEXT');
  if (!existing.has('country')) {
    db.exec(`ALTER TABLE users ADD COLUMN country TEXT
      CHECK (country IS NULL OR (length(country) = 2 AND country = upper(country)))`);
  }
  if (!existing.has('birth_date')) db.exec('ALTER TABLE users ADD COLUMN birth_date TEXT');
  if (!existing.has('height_cm')) {
    db.exec('ALTER TABLE users ADD COLUMN height_cm REAL CHECK (height_cm IS NULL OR (height_cm BETWEEN 50 AND 280))');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS body_weight_logs (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      weight      REAL NOT NULL CHECK (weight BETWEEN 20 AND 500),
      unit        TEXT NOT NULL CHECK (unit IN ('kg', 'lb')),
      recorded_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_body_weight_logs_user_date ON body_weight_logs (user_id, recorded_at DESC);
  `);

  const seed = db.prepare<[], { id: string; body_weight: number; weight_unit: string }>(
    `SELECT id, body_weight, weight_unit FROM users u
     WHERE body_weight IS NOT NULL AND NOT EXISTS (SELECT 1 FROM body_weight_logs l WHERE l.user_id = u.id)`,
  ).all();
  const insert = db.prepare('INSERT INTO body_weight_logs (id, user_id, weight, unit, recorded_at) VALUES (?, ?, ?, ?, ?)');
  const now = new Date().toISOString();
  for (const user of seed) insert.run(randomUUID(), user.id, user.body_weight, user.weight_unit, now);
}
