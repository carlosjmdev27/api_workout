import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import { DEFAULT_WEIGHT_UNIT, isWeightUnit, type User } from '@gym/shared';
import type { CreatedUser, NewUserRecord, ProfileData, UserRepository, UserWithHash } from '../user.repository.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
  body_weight: number | null;
  weight_unit: string;
}

const COLS = 'id, email, password_hash, name, created_at, body_weight, weight_unit';

const toUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  createdAt: row.created_at,
  bodyWeight: row.body_weight,
  // The column CHECK only allows 'kg' / 'lb'; the guard keeps the type honest.
  weightUnit: isWeightUnit(row.weight_unit) ? row.weight_unit : DEFAULT_WEIGHT_UNIT,
});

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE';
}

export class SqliteUserRepository implements UserRepository {
  private readonly db: Database;
  private readonly stmt: {
    findByEmail: Statement<[string], UserRow>;
    findById: Statement<[string], UserRow>;
    insert: Statement<UserRow>;
    count: Statement<[], { n: number }>;
    claim: Statement<[string]>[];
    updateProfile: Statement<ProfileData & { id: string }>;
    updateHash: Statement<{ id: string; hash: string }>;
  };

  constructor(db: Database) {
    this.db = db;
    this.stmt = {
      findByEmail: db.prepare(`SELECT ${COLS} FROM users WHERE email = ?`),
      findById: db.prepare(`SELECT ${COLS} FROM users WHERE id = ?`),
      insert: db.prepare(`INSERT INTO users (${COLS}) VALUES (@id, @email, @password_hash, @name, @created_at, @body_weight, @weight_unit)`),
      count: db.prepare('SELECT COUNT(*) AS n FROM users'),
      claim: [
        db.prepare('UPDATE routines SET user_id = ? WHERE user_id IS NULL'),
        db.prepare('UPDATE workout_sessions SET user_id = ? WHERE user_id IS NULL'),
        db.prepare('UPDATE exercise_catalog SET user_id = ? WHERE is_custom = 1 AND user_id IS NULL'),
      ],
      // The UNIQUE index on users.email rejects an email taken by another account atomically.
      updateProfile: db.prepare(
        'UPDATE users SET name = @name, email = @email, body_weight = @bodyWeight, weight_unit = @weightUnit WHERE id = @id',
      ),
      updateHash: db.prepare('UPDATE users SET password_hash = @hash WHERE id = @id'),
    };
  }

  async findByEmail(email: string): Promise<UserWithHash | null> {
    const row = this.stmt.findByEmail.get(email);
    return row ? { ...toUser(row), passwordHash: row.password_hash } : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = this.stmt.findById.get(id);
    return row ? toUser(row) : null;
  }

  async updateProfile(id: string, data: ProfileData): Promise<User | null | undefined> {
    try {
      if (this.stmt.updateProfile.run({ id, ...data }).changes === 0) return undefined;
    } catch (error) {
      if (isUniqueViolation(error)) return null;
      throw error;
    }
    return (await this.findById(id)) ?? undefined;
  }

  async findPasswordHash(id: string): Promise<string | null> {
    return this.stmt.findById.get(id)?.password_hash ?? null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<boolean> {
    return this.stmt.updateHash.run({ id, hash: passwordHash }).changes > 0;
  }

  async create(record: NewUserRecord): Promise<CreatedUser | null> {
    const row: UserRow = {
      id: randomUUID(),
      email: record.email,
      password_hash: record.passwordHash,
      name: record.name,
      created_at: new Date().toISOString(),
      body_weight: null,
      weight_unit: DEFAULT_WEIGHT_UNIT,
    };
    try {
      // One transaction: two simultaneous first registrations cannot both claim the data.
      return this.db.transaction((): CreatedUser => {
        this.stmt.insert.run(row);
        const isFirst = this.stmt.count.get()?.n === 1;
        if (isFirst) this.stmt.claim.forEach((statement) => statement.run(row.id));
        return { user: toUser(row), claimedLegacyData: isFirst };
      })();
    } catch (error) {
      if (isUniqueViolation(error)) return null;
      throw error;
    }
  }
}
