import { Router, type RequestHandler } from 'express';
import { loginInputSchema, registerInputSchema } from '@gym/shared';
import type { AuthController } from '../controllers/auth.controller.js';
import { authRateLimit } from '../middlewares/rate-limit.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';

/** Public sign-up / login (rate limited) and the protected session check. */
export function createAuthRouter(controller: AuthController, requireAuth: RequestHandler): Router {
  const router = Router();

  router.post('/auth/register', authRateLimit(true), validateBody(registerInputSchema), controller.register);
  router.post('/auth/login', authRateLimit(false), validateBody(loginInputSchema), controller.login);
  router.get('/auth/me', requireAuth, controller.me);

  return router;
}
