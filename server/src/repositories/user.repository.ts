import type { ProfileUpdate, User } from '@gym/shared';

/** A user plus private columns, which never leave the auth services. */
export interface UserWithHash extends User {
  passwordHash: string;
  emailVerified: boolean;
}

/** Pending email confirmation: SHA-256 of the emailed token + expiry (epoch ms). */
export interface VerificationTicket {
  tokenHash: string;
  expiresAt: number;
}

export interface NewUserRecord {
  name: string;
  /** Already normalized (trimmed, lowercase). */
  username: string;
  email: string;
  passwordHash: string;
  /** New accounts start unverified, with a pending confirmation. */
  verification: VerificationTicket;
}

/** Unique columns that another account may already use. */
export type UniqueField = 'email' | 'username';

export type CreateUserResult =
  | { status: 'created'; user: User; /** First account: took over the data created before login existed. */ claimedLegacyData: boolean }
  | { status: 'conflict'; field: UniqueField };

export type UpdateProfileResult =
  | { status: 'updated'; user: User }
  | { status: 'conflict'; field: UniqueField }
  | { status: 'missing' };

/** Editable account data (already validated and normalized). */
export type ProfileData = ProfileUpdate;

/** Persistence contract for accounts. */
export interface UserRepository {
  /** By email OR username (both stored in lowercase; compared case-insensitively). */
  findByIdentifier(identifier: string): Promise<UserWithHash | null>;
  findById(id: string): Promise<User | null>;
  /**
   * Creates the account atomically. If it is the first one, every row still without
   * owner (routines, sessions, custom exercises) is assigned to it in the same transaction.
   * UNIQUE violations (email / username) are reported, never thrown.
   */
  create(record: NewUserRecord): Promise<CreateUserResult>;
  /** Name, username, email, body weight and unit, with UNIQUE checked atomically. */
  updateProfile(id: string, data: ProfileData): Promise<UpdateProfileResult>;
  findPasswordHash(id: string): Promise<string | null>;
  updatePasswordHash(id: string, passwordHash: string): Promise<boolean>;
  /** Replaces the pending confirmation of an unverified account (resend). */
  setVerification(id: string, ticket: VerificationTicket): Promise<void>;
  /** Marks the email as verified if the token hash matches and has not expired. One use only. */
  confirmEmail(tokenHash: string, now: number): Promise<boolean>;
}
