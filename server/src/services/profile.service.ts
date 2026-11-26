import { LIMITS, type PersonalProfileUpdate, type PhysicalProfileUpdate, type User, type WeightLog, type WeightLogInput } from '@gym/shared';
import { NotFoundError } from '../errors/app-error.js';
import type { UserRepository } from '../repositories/user.repository.js';
import type { WeightLogRepository } from '../repositories/weight-log.repository.js';
import { sessionExpired } from './auth.service.js';

/** Answer of the weight-log writes: the entry + the user with the refreshed current weight. */
export interface WeightLogResult {
  log: WeightLog | null;
  user: User;
}

/** Personal / physical data and the body weight history of the logged-in user. */
export class ProfileService {
  private readonly users: UserRepository;
  private readonly weightLogs: WeightLogRepository;

  constructor(users: UserRepository, weightLogs: WeightLogRepository) {
    this.users = users;
    this.weightLogs = weightLogs;
  }

  /** Name, last name, country, birth date (validated by personalProfileSchema). */
  async updatePersonal(userId: string, input: PersonalProfileUpdate): Promise<User> {
    const user = await this.users.updatePersonal(userId, input);
    if (!user) throw sessionExpired();
    return user;
  }

  /**
   * Height + preferred unit. Routine / session weights are only relabelled (never converted);
   * the current body weight is re-derived from the newest weigh-in in the new unit.
   */
  async updatePhysical(userId: string, input: PhysicalProfileUpdate): Promise<User> {
    if (!(await this.users.updatePhysical(userId, input))) throw sessionExpired();
    await this.weightLogs.refreshCurrentWeight(userId);
    return this.current(userId);
  }

  listWeightLogs(userId: string): Promise<WeightLog[]> {
    return this.weightLogs.listByUser(userId, LIMITS.WEIGHT_LOGS_MAX);
  }

  /** New weigh-in (now by default); the newest entry becomes the current body weight. */
  async addWeightLog(userId: string, input: WeightLogInput): Promise<WeightLogResult> {
    await this.current(userId); // A deleted account's token cannot write.
    const recordedAt = new Date(input.recordedAt ?? Date.now()).toISOString();
    const log = await this.weightLogs.create(userId, { weight: input.weight, unit: input.unit, recordedAt });
    return { log, user: await this.current(userId) };
  }

  /** Only the owner's entries: another user's id answers 404 (never reveals it exists). */
  async deleteWeightLog(userId: string, logId: string): Promise<WeightLogResult> {
    if (!(await this.weightLogs.deleteOwned(userId, logId))) {
      throw new NotFoundError('WEIGHT_LOG_NOT_FOUND', 'Weight log not found');
    }
    return { log: null, user: await this.current(userId) };
  }

  private async current(userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user) throw sessionExpired();
    return user;
  }
}
