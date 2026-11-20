import type { User } from '@gym/shared';

/** A user plus the hash, which never leaves the auth service. */
export interface UserWithHash extends User {
  passwordHash: string;
}

export interface NewUserRecord {
  name: string;
  /** Already normalized (trimmed, lowercase). */
  email: string;
  passwordHash: string;
}

export interface CreatedUser {
  user: User;
  /** True when this first account took over the data created before login existed. */
  claimedLegacyData: boolean;
}

/** Persistence contract for accounts. */
export interface UserRepository {
  findByEmail(email: string): Promise<UserWithHash | null>;
  findById(id: string): Promise<User | null>;
  /**
   * Creates the account atomically. If it is the first one, every row still without
   * owner (routines, sessions, custom exercises) is assigned to it in the same transaction.
   * Returns null when the email is already registered.
   */
  create(record: NewUserRecord): Promise<CreatedUser | null>;
}
