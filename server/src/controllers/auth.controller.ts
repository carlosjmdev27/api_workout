import type { Request, Response } from 'express';
import type { LoginInput, RegisterInput } from '@gym/shared';
import { userIdOf } from '../middlewares/auth.middleware.js';
import type { AuthService } from '../services/auth.service.js';
import { sendSuccess } from './response.js';

type BodyRequest<T> = Request<Record<string, string>, unknown, T>;

/** HTTP layer for accounts. */
export class AuthController {
  private readonly service: AuthService;

  constructor(service: AuthService) {
    this.service = service;
  }

  register = async (req: BodyRequest<RegisterInput>, res: Response): Promise<void> => {
    sendSuccess(res, 201, await this.service.register(req.body));
  };

  login = async (req: BodyRequest<LoginInput>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.login(req.body));
  };

  me = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.me(userIdOf(req)));
  };
}
