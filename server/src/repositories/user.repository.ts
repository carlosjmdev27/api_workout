import type { ProfileUpdate, User } from '@gym/shared';

/** Editable account data (already validated and normalized). */
export type ProfileData = ProfileUpdate;

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
  /**
   * Updates name, (already normalized) email, body weight and weight unit. Returns undefined
   * if the user does not exist and null when the email belongs to another account
   * (UNIQUE, checked atomically).
   */
  updateProfile(id: string, data: ProfileData): Promise<User | null | undefined>;
  findPasswordHash(id: string): Promise<string | null>;
  updatePasswordHash(id: string, passwordHash: string): Promise<boolean>;
}
