import type { Request, Response } from 'express';
import type { ReorderDaysInput, WorkoutDayInput } from '@gym/shared';
import type { DayParams, RoutineParams } from '../schemas/params.schema.js';
import type { WorkoutDayService } from '../services/workout-day.service.js';
import { userIdOf } from '../middlewares/auth.middleware.js';
import { sendNoContent, sendSuccess } from './response.js';

/** HTTP layer for the workout days ("tablas") of a routine. */
export class WorkoutDayController {
  private readonly service: WorkoutDayService;

  constructor(service: WorkoutDayService) {
    this.service = service;
  }

  listByRoutine = async (req: Request<RoutineParams>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.listByRoutine(userIdOf(req), req.params.routineId));
  };

  create = async (req: Request<RoutineParams, unknown, WorkoutDayInput>, res: Response): Promise<void> => {
    sendSuccess(res, 201, await this.service.create(userIdOf(req), req.params.routineId, req.body));
  };

  reorder = async (req: Request<RoutineParams, unknown, ReorderDaysInput>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.reorder(userIdOf(req), req.params.routineId, req.body.dayIds));
  };

  getById = async (req: Request<DayParams>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.getById(userIdOf(req), req.params.dayId));
  };

  rename = async (req: Request<DayParams, unknown, WorkoutDayInput>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.rename(userIdOf(req), req.params.dayId, req.body));
  };

  delete = async (req: Request<DayParams>, res: Response): Promise<void> => {
    await this.service.delete(userIdOf(req), req.params.dayId);
    sendNoContent(res);
  };
}
