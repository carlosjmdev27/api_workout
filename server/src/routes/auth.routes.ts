import { Router, type RequestHandler } from 'express';
import {
  loginInputSchema,
  passwordChangeSchema,
  profileUpdateSchema,
  registerInputSchema,
  resendVerificationSchema,
} from '@gym/shared';
import type { AuthController } from '../controllers/auth.controller.js';
import { authRateLimit } from '../middlewares/rate-limit.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';

/** Public sign-up / login / email confirmation (rate limited) and the protected account endpoints. */
export function createAuthRouter(controller: AuthController, requireAuth: RequestHandler): Router {
  const router = Router();

  router.post('/auth/register', authRateLimit(true), validateBody(registerInputSchema), controller.register);
  router.post('/auth/login', authRateLimit(false), validateBody(loginInputSchema), controller.login);
  // Tokens are 256-bit random: guessing is not feasible, so the link is not rate limited.
  router.get('/auth/verify-email', controller.verifyEmail);
  // Every call counts: it sends emails, so nobody can flood an inbox from one IP.
  router.post('/auth/resend-verification', authRateLimit(true), validateBody(resendVerificationSchema), controller.resendVerification);
  router.get('/auth/me', requireAuth, controller.me);
  router.put('/auth/profile', requireAuth, validateBody(profileUpdateSchema), controller.updateProfile);
  // Wrong current passwords count like failed logins: a stolen session cannot brute-force it.
  router.put('/auth/password', requireAuth, authRateLimit(false), validateBody(passwordChangeSchema), controller.changePassword);

  return router;
}
