import type { Request, Response } from 'express';
import type { SessionInput } from '@gym/shared';
import type { DayParams, SessionParams } from '../schemas/params.schema.js';
import type { SessionService } from '../services/session.service.js';
import { userIdOf } from '../middlewares/auth.middleware.js';
import { sendNoContent, sendSuccess } from './response.js';

/** HTTP layer for the workout history. */
export class SessionController {
  private readonly service: SessionService;

  constructor(service: SessionService) {
    this.service = service;
  }

  create = async (
    req: Request<Record<string, string>, unknown, SessionInput>,
    res: Response,
  ): Promise<void> => {
    sendSuccess(res, 201, await this.service.create(userIdOf(req), req.body));
  };

  getById = async (req: Request<SessionParams>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.getById(userIdOf(req), req.params.sessionId));
  };

  historyByDay = async (req: Request<DayParams>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.historyByDay(userIdOf(req), req.params.dayId));
  };

  delete = async (req: Request<SessionParams>, res: Response): Promise<void> => {
    await this.service.delete(userIdOf(req), req.params.sessionId);
    sendNoContent(res);
  };
}
