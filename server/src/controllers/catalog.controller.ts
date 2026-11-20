import type { Request, Response } from 'express';
import type { CatalogExerciseInput, CatalogQuery } from '@gym/shared';
import type { CatalogService } from '../services/catalog.service.js';
import { userIdOf } from '../middlewares/auth.middleware.js';
import { sendSuccess } from './response.js';

type NoParams = Record<string, string>;

/** HTTP layer for the exercise catalog. */
export class CatalogController {
  private readonly service: CatalogService;

  constructor(service: CatalogService) {
    this.service = service;
  }

  search = async (req: Request<NoParams, unknown, unknown, CatalogQuery>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.search(userIdOf(req), req.query));
  };

  create = async (req: Request<NoParams, unknown, CatalogExerciseInput>, res: Response): Promise<void> => {
    sendSuccess(res, 201, await this.service.createCustom(userIdOf(req), req.body));
  };
}
