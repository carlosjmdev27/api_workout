import type { AuthResponse, LoginInput, PasswordChange, ProfileUpdate, RegisterInput, RegisterResponse, User } from '@gym/shared';
import { AppError, BadRequestError, ConflictError, ForbiddenError, UnauthorizedError } from '../errors/app-error.js';
import type { UniqueField, UserRepository } from '../repositories/user.repository.js';
import type { EmailDomainChecker } from './email-domain.service.js';
import type { PasswordService } from './password.service.js';
import type { TokenService } from './token.service.js';
import type { EmailVerificationService } from './verification.service.js';

export interface AuthOptions {
  allowRegistration: boolean;
  /** false: no confirmation email; new and pending accounts can log in directly. */
  requireEmailVerification: boolean;
}

export interface AuthDependencies {
  users: UserRepository;
  passwords: PasswordService;
  tokens: TokenService;
  verification: EmailVerificationService;
  emailDomains: EmailDomainChecker;
}

/** Same error for unknown account and wrong password: never reveal which one failed. */
const invalidCredentials = (): UnauthorizedError =>
  new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid credentials');

export const sessionExpired = (): UnauthorizedError =>
  new UnauthorizedError('UNAUTHORIZED', 'Missing, invalid or expired session');

const taken = (field: UniqueField): ConflictError =>
  field === 'username'
    ? new ConflictError('USERNAME_IN_USE', 'This username is already taken')
    : new ConflictError('EMAIL_IN_USE', 'An account with this email already exists');

/** Accounts: sign-up with email confirmation, login, session check and profile. */
export class AuthService {
  private readonly deps: AuthDependencies;
  private readonly options: AuthOptions;

  constructor(deps: AuthDependencies, options: AuthOptions) {
    this.deps = deps;
    this.options = options;
  }

  /**
   * Creates the account. With verification required (default) it starts UNVERIFIED and the
   * confirmation link is emailed; otherwise it is created verified and no email is sent.
   * The MX check applies in both modes. No session yet in either case.
   */
  async register(input: RegisterInput): Promise<RegisterResponse> {
    if (!this.options.allowRegistration) {
      throw new ForbiddenError('REGISTRATION_CLOSED', 'New accounts cannot be created');
    }
    await this.assertEmailCanReceiveMail(input.email);
    const required = this.options.requireEmailVerification;
    const pending = required ? this.deps.verification.newTicket() : null;
    const passwordHash = await this.deps.passwords.hash(input.password);
    const { name, username, email } = input; // The plain password never goes further than here.
    const created = await this.deps.users.create({ name, username, email, passwordHash, verification: pending?.ticket ?? null });
    if (created.status === 'conflict') throw taken(created.field);
    if (created.claimedLegacyData) {
      console.log(`First account created: existing routines and history assigned to user ${created.user.id}`);
    }
    const emailSent = pending ? await this.deps.verification.send(created.user, pending.token) : false;
    return { email: created.user.email, emailSent, verificationRequired: required };
  }

  /**
   * Email OR username + password. A correct password on an unconfirmed account -> 403,
   * unless verification is switched off: then the account is marked verified on the way in
   * (accounts created while it was required are not left locked out).
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const found = await this.deps.users.findByIdentifier(input.identifier);
    const ok = await this.deps.passwords.matches(input.password, found?.passwordHash ?? null);
    if (!found || !ok) throw invalidCredentials();
    // Only after the password check: this answer cannot be used to probe which accounts exist.
    if (!found.emailVerified) {
      if (this.options.requireEmailVerification) {
        throw new ForbiddenError('EMAIL_NOT_VERIFIED', 'Confirm your email address before logging in');
      }
      await this.deps.users.markEmailVerified(found.id);
    }
    // Explicit allowlist: the hash and other private columns never leave this service.
    const { id, email, username, name, createdAt, bodyWeight, weightUnit } = found;
    return this.issue({ id, email, username, name, createdAt, bodyWeight, weightUnit });
  }

  /** Resolves a bearer token to an existing user (a deleted user's token is useless). */
  async authenticate(token: string): Promise<User> {
    const userId = this.deps.tokens.verify(token);
    const user = userId ? await this.deps.users.findById(userId) : null;
    if (!user) throw sessionExpired();
    return user;
  }

  async me(userId: string): Promise<User> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw sessionExpired();
    return user;
  }

  /**
   * Name, username, email (normalized by the schema), body weight and unit. A NEW email
   * must have mail servers too; another account's email or username -> 409.
   * Changing the unit relabels weights; stored numbers are never converted.
   */
  async updateProfile(userId: string, input: ProfileUpdate): Promise<User> {
    const current = await this.me(userId);
    if (input.email !== current.email) await this.assertEmailCanReceiveMail(input.email);
    const result = await this.deps.users.updateProfile(userId, input);
    if (result.status === 'missing') throw sessionExpired();
    if (result.status === 'conflict') throw taken(result.field);
    return result.user;
  }

  /**
   * Requires the current password. Answers 400 (not 401) when it is wrong: a 401 means
   * "your session is invalid" and the client would log the user out.
   */
  async changePassword(userId: string, input: PasswordChange): Promise<void> {
    const hash = await this.deps.users.findPasswordHash(userId);
    if (hash === null) throw sessionExpired();
    if (!(await this.deps.passwords.matches(input.currentPassword, hash))) {
      throw new BadRequestError('INVALID_CURRENT_PASSWORD', 'The current password is incorrect');
    }
    await this.deps.users.updatePasswordHash(userId, await this.deps.passwords.hash(input.newPassword));
  }

  /** Rejects invented / mistyped domains (no MX). A DNS outage is a 503, not the user's fault. */
  private async assertEmailCanReceiveMail(email: string): Promise<void> {
    const check = await this.deps.emailDomains.check(email);
    if (check === 'no-mail') {
      throw new BadRequestError('EMAIL_DOMAIN_INVALID', 'The email domain cannot receive mail');
    }
    if (check === 'unavailable') {
      throw new AppError(503, 'EMAIL_CHECK_UNAVAILABLE', 'The email domain could not be checked, try again');
    }
  }

  private issue(user: User): AuthResponse {
    return { token: this.deps.tokens.sign(user.id), user };
  }
}
