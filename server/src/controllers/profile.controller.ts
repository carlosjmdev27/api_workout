import type { Request, Response } from 'express';
import type { PersonalProfileUpdate, PhysicalProfileUpdate, WeightLogInput } from '@gym/shared';
import { userIdOf } from '../middlewares/auth.middleware.js';
import type { WeightLogParams } from '../schemas/params.schema.js';
import type { ProfileService } from '../services/profile.service.js';
import { sendSuccess } from './response.js';

type BodyRequest<T> = Request<Record<string, string>, unknown, T>;

/** HTTP layer for /api/profile/* (personal data, physical data, body weight history). */
export class ProfileController {
  private readonly service: ProfileService;

  constructor(service: ProfileService) {
    this.service = service;
  }

  updatePersonal = async (req: BodyRequest<PersonalProfileUpdate>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.updatePersonal(userIdOf(req), req.body));
  };

  updatePhysical = async (req: BodyRequest<PhysicalProfileUpdate>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.updatePhysical(userIdOf(req), req.body));
  };

  listWeightLogs = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.listWeightLogs(userIdOf(req)));
  };

  addWeightLog = async (req: BodyRequest<WeightLogInput>, res: Response): Promise<void> => {
    sendSuccess(res, 201, await this.service.addWeightLog(userIdOf(req), req.body));
  };

  deleteWeightLog = async (req: Request<WeightLogParams>, res: Response): Promise<void> => {
    sendSuccess(res, 200, await this.service.deleteWeightLog(userIdOf(req), req.params.logId));
  };
}
