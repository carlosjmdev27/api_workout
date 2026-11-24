import type { AuthResponse, LoginInput, PasswordChange, ProfileUpdate, RegisterInput, User } from '@gym/shared';
import { BadRequestError, ConflictError, ForbiddenError, UnauthorizedError } from '../errors/app-error.js';
import type { UserRepository } from '../repositories/user.repository.js';
import type { PasswordService } from './password.service.js';
import type { TokenService } from './token.service.js';

export interface AuthOptions {
  allowRegistration: boolean;
}

/** Same error for unknown email and wrong password: never reveal which one failed. */
const invalidCredentials = (): UnauthorizedError =>
  new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid credentials');

export const sessionExpired = (): UnauthorizedError =>
  new UnauthorizedError('UNAUTHORIZED', 'Missing, invalid or expired session');

/** Accounts: sign-up, login and session check. */
export class AuthService {
  private readonly users: UserRepository;
  private readonly passwords: PasswordService;
  private readonly tokens: TokenService;
  private readonly options: AuthOptions;

  constructor(users: UserRepository, passwords: PasswordService, tokens: TokenService, options: AuthOptions) {
    this.users = users;
    this.passwords = passwords;
    this.tokens = tokens;
    this.options = options;
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    if (!this.options.allowRegistration) {
      throw new ForbiddenError('REGISTRATION_CLOSED', 'New accounts cannot be created');
    }
    const passwordHash = await this.passwords.hash(input.password);
    const created = await this.users.create({ name: input.name, email: input.email, passwordHash });
    if (!created) throw new ConflictError('EMAIL_IN_USE', 'An account with this email already exists');
    if (created.claimedLegacyData) {
      console.log(`First account created: existing routines and history assigned to user ${created.user.id}`);
    }
    return this.issue(created.user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const found = await this.users.findByEmail(input.email);
    const ok = await this.passwords.matches(input.password, found?.passwordHash ?? null);
    if (!found || !ok) throw invalidCredentials();
    return this.issue({ id: found.id, email: found.email, name: found.name, createdAt: found.createdAt });
  }

  /** Resolves a bearer token to an existing user (a deleted user's token is useless). */
  async authenticate(token: string): Promise<User> {
    const userId = this.tokens.verify(token);
    const user = userId ? await this.users.findById(userId) : null;
    if (!user) throw sessionExpired();
    return user;
  }

  async me(userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user) throw sessionExpired();
    return user;
  }

  /** Name + email (normalized by the schema). Another account's email -> 409. */
  async updateProfile(userId: string, input: ProfileUpdate): Promise<User> {
    const updated = await this.users.updateProfile(userId, { name: input.name, email: input.email });
    if (updated === undefined) throw sessionExpired();
    if (updated === null) throw new ConflictError('EMAIL_IN_USE', 'An account with this email already exists');
    return updated;
  }

  /**
   * Requires the current password. Answers 400 (not 401) when it is wrong: a 401 means
   * "your session is invalid" and the client would log the user out.
   */
  async changePassword(userId: string, input: PasswordChange): Promise<void> {
    const hash = await this.users.findPasswordHash(userId);
    if (hash === null) throw sessionExpired();
    if (!(await this.passwords.matches(input.currentPassword, hash))) {
      throw new BadRequestError('INVALID_CURRENT_PASSWORD', 'The current password is incorrect');
    }
    await this.users.updatePasswordHash(userId, await this.passwords.hash(input.newPassword));
  }

  private issue(user: User): AuthResponse {
    return { token: this.tokens.sign(user.id), user };
  }
}
