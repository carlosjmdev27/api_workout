import bcrypt from 'bcryptjs';

/** bcrypt cost (2^12 rounds): ~0.25 s per hash, slow enough to make guessing expensive. */
const SALT_ROUNDS = 12;

/**
 * Compared when the email does not exist, so a login takes the same time either way
 * and response timing cannot reveal which emails are registered.
 */
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer-not-a-real-password', SALT_ROUNDS);

/** Password hashing (bcryptjs: pure JS, no native build in node:alpine images). */
export class PasswordService {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /** Always runs one bcrypt comparison, even without a stored hash. */
  async matches(password: string, hash: string | null): Promise<boolean> {
    const ok = await bcrypt.compare(password, hash ?? DUMMY_HASH);
    return ok && hash !== null;
  }
}
