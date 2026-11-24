import type { Database } from 'better-sqlite3';
import { columnNames } from './schema-info.js';

// Frozen copies (an applied migration must never change): 3-20 chars of [a-z0-9_].
const USERNAME_MIN = 3;
const USERNAME_MAX = 20;
/** Leaves room for a numeric suffix ("carlos" -> "carlos2") within USERNAME_MAX. */
const BASE_MAX = 16;

/** "Carlos.Martín-27" -> "carlos_martin_27" (only [a-z0-9_], no leading/trailing "_"). */
function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/** Username derived from the email's local part (or the name), always valid. */
export function baseUsername(email: string, name: string): string {
  let base = slug(email.split('@')[0] ?? '') || slug(name) || 'user';
  if (base.length < USERNAME_MIN) base = `${base}_user`;
  return base.slice(0, BASE_MAX).replace(/_+$/, '') || 'user';
}

/** First free candidate: base, base2, base3… (never longer than USERNAME_MAX). */
export function uniqueUsername(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1) {
    const suffix = String(n);
    const candidate = `${base.slice(0, USERNAME_MAX - suffix.length)}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}

function backfillUsernames(db: Database): void {
  const rows = db
    .prepare<[], { id: string; email: string; name: string; username: string | null }>(
      'SELECT id, email, name, username FROM users ORDER BY created_at',
    )
    .all();
  const taken = new Set(rows.flatMap((row) => (row.username ? [row.username] : [])));
  const update = db.prepare('UPDATE users SET username = ? WHERE id = ?');
  for (const row of rows.filter((r) => !r.username)) {
    const username = uniqueUsername(baseUsername(row.email, row.name), taken);
    taken.add(username);
    update.run(username, row.id);
  }
}

/**
 * v7 — username + email verification. ADD COLUMN only, each one only if PRAGMA
 * table_info does not list it yet (re-running is harmless).
 * - Accounts that already exist are marked as verified (only when the column is created
 *   here, so a later re-run can never verify a new, unconfirmed account).
 * - Existing users get a username derived from their email (unique, valid).
 * - verification_token stores the SHA-256 of the emailed token, never the token itself.
 */
export function addEmailVerification(db: Database): void {
  const existing = columnNames(db, 'users');
  if (!existing.has('username')) db.exec('ALTER TABLE users ADD COLUMN username TEXT');
  if (!existing.has('email_verified')) {
    db.exec(`ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0
      CHECK (email_verified IN (0, 1))`);
    db.exec('UPDATE users SET email_verified = 1');
  }
  if (!existing.has('verification_token')) db.exec('ALTER TABLE users ADD COLUMN verification_token TEXT');
  if (!existing.has('verification_expires')) db.exec('ALTER TABLE users ADD COLUMN verification_expires INTEGER');

  backfillUsernames(db);
  // UNIQUE through indexes (ALTER TABLE ADD COLUMN cannot declare UNIQUE). NULLs never collide.
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS ux_users_username ON users (username)');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS ux_users_verification_token ON users (verification_token)');
}
