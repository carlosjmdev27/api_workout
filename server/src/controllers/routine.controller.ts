import type { Request, Response } from 'express';
import type { RoutineInput, RoutineUpdate } from '@gym/shared';
import type { RoutineParams } from '../schemas/params.schema.js';
import type { RoutineService } from '../services/routine.service.js';
import { sendNoContent, sendSuccess } from './response.js';

/**
 * HTTP layer only: reads already-validated input, calls the service and
 * shapes the response. Errors bubble up to the global error handler.
 */
export class RoutineController {
  private readonly service: RoutineService;

  constructor(service: RoutineService) {
    this.service = service;
  }

  list = async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.list());
  };

  getById = async (req: Request<RoutineParams>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.getById(req.params.routineId));
  };

  create = async (
    req: Request<Record<string, string>, unknown, RoutineInput>,
    res: Response,
  ): Promise<void> => {
    sendSuccess(res, 201, await this.service.create(req.body));
  };

  update = async (req: Request<RoutineParams, unknown, RoutineUpdate>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.update(req.params.routineId, req.body));
  };

  delete = async (req: Request<RoutineParams>, res: Response): Promise<void> => {
    await this.service.delete(req.params.routineId);
    sendNoContent(res);
  };
}
