import type { Request, Response } from 'express';
import type { DayExerciseInput, DayExerciseUpdate, ReorderExercisesInput } from '@gym/shared';
import type { DayParams, ExerciseParams } from '../schemas/params.schema.js';
import type { DayExerciseService } from '../services/day-exercise.service.js';
import { sendNoContent, sendSuccess } from './response.js';

/** HTTP layer for the exercises of a workout day and their planned sets. */
export class DayExerciseController {
  private readonly service: DayExerciseService;

  constructor(service: DayExerciseService) {
    this.service = service;
  }

  create = async (req: Request<DayParams, unknown, DayExerciseInput>, res: Response): Promise<void> => {
    sendSuccess(res, 201, await this.service.create(req.params.dayId, req.body));
  };

  reorder = async (
    req: Request<DayParams, unknown, ReorderExercisesInput>,
    res: Response,
  ): Promise<void> => {
    sendSuccess(res, 200, await this.service.reorder(req.params.dayId, req.body.exerciseIds));
  };

  update = async (
    req: Request<ExerciseParams, unknown, DayExerciseUpdate>,
    res: Response,
  ): Promise<void> => {
    sendSuccess(res, 200, await this.service.update(req.params.exerciseId, req.body));
  };

  delete = async (req: Request<ExerciseParams>, res: Response): Promise<void> => {
    await this.service.delete(req.params.exerciseId);
    sendNoContent(res);
  };
}
