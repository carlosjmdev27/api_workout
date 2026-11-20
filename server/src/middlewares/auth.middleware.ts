import type { Request, RequestHandler } from 'express';
import { sessionExpired, type AuthService } from '../services/auth.service.js';

const BEARER = /^Bearer ([A-Za-z0-9\-_.]+)$/;

/**
 * Requires `Authorization: Bearer <token>` and attaches `req.user = { id }`.
 * The id comes only from the verified token, never from the request body or params.
 */
export function authenticate(auth: AuthService): RequestHandler {
  return async (req, _res, next) => {
    const match = BEARER.exec(req.headers.authorization ?? '');
    if (!match?.[1]) throw sessionExpired();
    const user = await auth.authenticate(match[1]);
    req.user = { id: user.id };
    next();
  };
}

/** Id of the authenticated user. Only valid behind `authenticate`. */
export function userIdOf(req: Request): string {
  if (!req.user) throw sessionExpired();
  return req.user.id;
}
