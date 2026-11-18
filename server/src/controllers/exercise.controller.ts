import type { Request, Response } from 'express';
import type { ExerciseParams, RoutineParams } from '../schemas/common.schema.js';
import type { ReorderExercisesBody } from '../schemas/exercise.schema.js';
import type { ExerciseService } from '../services/exercise.service.js';
import type { ExerciseInput, ExerciseUpdate } from '../types/exercise.types.js';
import { sendNoContent, sendSuccess } from './response.js';

/** HTTP layer for the exercises of a routine. */
export class ExerciseController {
  private readonly service: ExerciseService;

  constructor(service: ExerciseService) {
    this.service = service;
  }

  list = async (req: Request<RoutineParams>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.list(req.params.routineId));
  };

  create = async (
    req: Request<RoutineParams, unknown, ExerciseInput>,
    res: Response,
  ): Promise<void> => {
    sendSuccess(res, 201, await this.service.create(req.params.routineId, req.body));
  };

  update = async (
    req: Request<ExerciseParams, unknown, ExerciseUpdate>,
    res: Response,
  ): Promise<void> => {
    const { routineId, exerciseId } = req.params;
    sendSuccess(res, 200, await this.service.update(routineId, exerciseId, req.body));
  };

  delete = async (req: Request<ExerciseParams>, res: Response): Promise<void> => {
    await this.service.delete(req.params.routineId, req.params.exerciseId);
    sendNoContent(res);
  };

  reorder = async (
    req: Request<RoutineParams, unknown, ReorderExercisesBody>,
    res: Response,
  ): Promise<void> => {
    const exercises = await this.service.reorder(req.params.routineId, req.body.exerciseIds);
    sendSuccess(res, 200, exercises);
  };
}
