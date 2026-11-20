import jwt from 'jsonwebtoken';

/** 7 days: comfortable for personal use at the gym (PROJECT_SPEC §12). */
export const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const ALGORITHM = 'HS256';

/** Signs and verifies session tokens. The payload only carries the user id. */
export class TokenService {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  sign(userId: string): string {
    return jwt.sign({ userId }, this.secret, { algorithm: ALGORITHM, expiresIn: TOKEN_TTL_SECONDS });
  }

  /** The user id, or null if the token is malformed, tampered with or expired. */
  verify(token: string): string | null {
    try {
      // Pinning the algorithm rejects "alg: none" and algorithm-confusion tokens.
      const payload = jwt.verify(token, this.secret, { algorithms: [ALGORITHM] });
      if (typeof payload === 'object' && typeof payload.userId === 'string') return payload.userId;
      return null;
    } catch {
      return null;
    }
  }
}
