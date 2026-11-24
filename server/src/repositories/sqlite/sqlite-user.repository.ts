import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import { DEFAULT_WEIGHT_UNIT, isWeightUnit, type User } from '@gym/shared';
import type {
  CreateUserResult,
  NewUserRecord,
  ProfileData,
  UniqueField,
  UpdateProfileResult,
  UserRepository,
  UserWithHash,
  VerificationTicket,
} from '../user.repository.js';

interface UserRow {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  name: string;
  created_at: string;
  body_weight: number | null;
  weight_unit: string;
  email_verified: number;
}

const COLS = 'id, email, username, password_hash, name, created_at, body_weight, weight_unit, email_verified';

const toUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  username: row.username,
  name: row.name,
  createdAt: row.created_at,
  bodyWeight: row.body_weight,
  // The column CHECK only allows 'kg' / 'lb'; the guard keeps the type honest.
  weightUnit: isWeightUnit(row.weight_unit) ? row.weight_unit : DEFAULT_WEIGHT_UNIT,
});

/** Which UNIQUE column was violated ("UNIQUE constraint failed: users.username"), if any. */
function uniqueViolation(error: unknown): UniqueField | null {
  if (!(error instanceof Error && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE')) return null;
  return error.message.includes('users.username') ? 'username' : 'email';
}

export class SqliteUserRepository implements UserRepository {
  private readonly db: Database;
  private readonly stmt: {
    findByIdentifier: Statement<{ identifier: string }, UserRow>;
    findById: Statement<[string], UserRow>;
    insert: Statement<Omit<UserRow, 'body_weight' | 'weight_unit'> & VerificationTicket>;
    count: Statement<[], { n: number }>;
    claim: Statement<[string]>[];
    updateProfile: Statement<ProfileData & { id: string }>;
    updateHash: Statement<{ id: string; hash: string }>;
    setVerification: Statement<VerificationTicket & { id: string }>;
    confirm: Statement<{ tokenHash: string; now: number }>;
  };

  constructor(db: Database) {
    this.db = db;
    this.stmt = {
      // Case-insensitive by construction: email, username and identifier are all stored /
      // validated in lowercase, so plain equality can use both UNIQUE indexes (LOWER() could not).
      findByIdentifier: db.prepare(`SELECT ${COLS} FROM users WHERE email = @identifier OR username = @identifier`),
      findById: db.prepare(`SELECT ${COLS} FROM users WHERE id = ?`),
      insert: db.prepare(
        `INSERT INTO users (id, email, username, password_hash, name, created_at, email_verified, verification_token, verification_expires)
         VALUES (@id, @email, @username, @password_hash, @name, @created_at, @email_verified, @tokenHash, @expiresAt)`,
      ),
      count: db.prepare('SELECT COUNT(*) AS n FROM users'),
      claim: [
        db.prepare('UPDATE routines SET user_id = ? WHERE user_id IS NULL'),
        db.prepare('UPDATE workout_sessions SET user_id = ? WHERE user_id IS NULL'),
        db.prepare('UPDATE exercise_catalog SET user_id = ? WHERE is_custom = 1 AND user_id IS NULL'),
      ],
      // UNIQUE indexes on email / username reject another account's value atomically.
      updateProfile: db.prepare(
        `UPDATE users SET name = @name, username = @username, email = @email,
         body_weight = @bodyWeight, weight_unit = @weightUnit WHERE id = @id`,
      ),
      updateHash: db.prepare('UPDATE users SET password_hash = @hash WHERE id = @id'),
      setVerification: db.prepare(
        'UPDATE users SET verification_token = @tokenHash, verification_expires = @expiresAt WHERE id = @id AND email_verified = 0',
      ),
      confirm: db.prepare(
        `UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires = NULL
         WHERE verification_token = @tokenHash AND verification_expires > @now`,
      ),
    };
  }

  async findByIdentifier(identifier: string): Promise<UserWithHash | null> {
    const row = this.stmt.findByIdentifier.get({ identifier });
    return row ? { ...toUser(row), passwordHash: row.password_hash, emailVerified: row.email_verified === 1 } : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = this.stmt.findById.get(id);
    return row ? toUser(row) : null;
  }

  async updateProfile(id: string, data: ProfileData): Promise<UpdateProfileResult> {
    try {
      if (this.stmt.updateProfile.run({ id, ...data }).changes === 0) return { status: 'missing' };
    } catch (error) {
      const field = uniqueViolation(error);
      if (field) return { status: 'conflict', field };
      throw error;
    }
    const user = await this.findById(id);
    return user ? { status: 'updated', user } : { status: 'missing' };
  }

  async findPasswordHash(id: string): Promise<string | null> {
    return this.stmt.findById.get(id)?.password_hash ?? null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<boolean> {
    return this.stmt.updateHash.run({ id, hash: passwordHash }).changes > 0;
  }

  async setVerification(id: string, ticket: VerificationTicket): Promise<void> {
    this.stmt.setVerification.run({ id, ...ticket });
  }

  async confirmEmail(tokenHash: string, now: number): Promise<boolean> {
    return this.stmt.confirm.run({ tokenHash, now }).changes > 0;
  }

  async create(record: NewUserRecord): Promise<CreateUserResult> {
    const row = {
      id: randomUUID(),
      email: record.email,
      username: record.username,
      password_hash: record.passwordHash,
      name: record.name,
      created_at: new Date().toISOString(),
      email_verified: 0,
      ...record.verification,
    };
    try {
      // One transaction: two simultaneous first registrations cannot both claim the data.
      return this.db.transaction((): CreateUserResult => {
        this.stmt.insert.run(row);
        const isFirst = this.stmt.count.get()?.n === 1;
        if (isFirst) this.stmt.claim.forEach((statement) => statement.run(row.id));
        const user = toUser({ ...row, body_weight: null, weight_unit: DEFAULT_WEIGHT_UNIT });
        return { status: 'created', user, claimedLegacyData: isFirst };
      })();
    } catch (error) {
      const field = uniqueViolation(error);
      if (field) return { status: 'conflict', field };
      throw error;
    }
  }
}
