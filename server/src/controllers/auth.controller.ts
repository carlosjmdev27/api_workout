import type { Request, Response } from 'express';
import type { IdentityUpdate, LoginInput, PasswordChange, RegisterInput, ResendVerificationInput } from '@gym/shared';
import { userIdOf } from '../middlewares/auth.middleware.js';
import type { AuthService } from '../services/auth.service.js';
import type { EmailVerificationService } from '../services/verification.service.js';
import { sendNoContent, sendSuccess } from './response.js';

type BodyRequest<T> = Request<Record<string, string>, unknown, T>;

/** HTTP layer for accounts. */
export class AuthController {
  private readonly service: AuthService;
  private readonly verification: EmailVerificationService;
  /** Where the web lives: "" = same origin (production); the Vite / nginx origin otherwise. */
  private readonly webOrigin: string;

  constructor(service: AuthService, verification: EmailVerificationService, webOrigin: string) {
    this.service = service;
    this.verification = verification;
    this.webOrigin = webOrigin.replace(/\/+$/, '');
  }

  register = async (req: BodyRequest<RegisterInput>, res: Response): Promise<void> => {
    sendSuccess(res, 201, await this.service.register(req.body));
  };

  login = async (req: BodyRequest<LoginInput>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.login(req.body));
  };

  /** Link from the email: confirms and sends the browser to the login screen with the outcome. */
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const ok = await this.verification.confirm(token);
    res.set('Cache-Control', 'no-store');
    res.redirect(303, `${this.webOrigin}/login?verified=${ok ? 'true' : 'invalid'}`);
  };

  /** Always 202, whether or not the account exists (see EmailVerificationService.resend). */
  resendVerification = (req: BodyRequest<ResendVerificationInput>, res: Response): void => {
    void this.verification.resend(req.body.identifier).catch((error: unknown) => {
      console.error('Resend verification failed:', error instanceof Error ? error.message : error);
    });
    sendSuccess(res, 202, { requested: true });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.me(userIdOf(req)));
  };

  updateIdentity = async (req: BodyRequest<IdentityUpdate>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.updateIdentity(userIdOf(req), req.body));
  };

  changePassword = async (req: BodyRequest<PasswordChange>, res: Response): Promise<void> => {
    await this.service.changePassword(userIdOf(req), req.body);
    sendNoContent(res);
  };
}
