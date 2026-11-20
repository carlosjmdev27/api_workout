import { rateLimit } from 'express-rate-limit';
import type { RequestHandler } from 'express';
import type { ApiError } from '@gym/shared';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const tooManyRequests: ApiError = {
  success: false,
  error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts, try again later' },
};

/**
 * Brute-force protection for the public auth endpoints: 10 attempts / 15 min per IP.
 * Login only counts failures, so the real owner is not locked out by their own logins.
 */
export function authRateLimit(countSuccess: boolean): RequestHandler {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit: MAX_ATTEMPTS,
    skipSuccessfulRequests: !countSuccess,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json(tooManyRequests);
    },
  });
}
