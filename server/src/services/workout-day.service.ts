import { LIMITS, type WorkoutDay, type WorkoutDayDetail, type WorkoutDayInput } from '@gym/shared';
import type { WorkoutDayRepository } from '../repositories/workout-day.repository.js';
import type { AccessGuard } from './access.guard.js';
import { assertSameIds, dayNotFound, limitReached } from './errors.js';

/** Business logic for the workout days ("tablas") of a routine. Every call is scoped to a user. */
export class WorkoutDayService {
  private readonly days: WorkoutDayRepository;
  private readonly access: AccessGuard;

  constructor(days: WorkoutDayRepository, access: AccessGuard) {
    this.days = days;
    this.access = access;
  }

  async listByRoutine(userId: string, routineId: string): Promise<WorkoutDay[]> {
    await this.access.assertRoutine(userId, routineId);
    return this.days.findByRoutine(routineId);
  }

  async getById(userId: string, dayId: string): Promise<WorkoutDayDetail> {
    await this.access.assertDay(userId, dayId);
    const day = await this.days.findById(dayId);
    if (!day) throw dayNotFound(dayId);
    return day;
  }

  async create(userId: string, routineId: string, input: WorkoutDayInput): Promise<WorkoutDay> {
    const current = await this.listByRoutine(userId, routineId);
    if (current.length >= LIMITS.DAYS_PER_ROUTINE_MAX) {
      throw limitReached('DAY_LIMIT_REACHED', 'workout days per routine', LIMITS.DAYS_PER_ROUTINE_MAX);
    }
    return this.days.create(routineId, input);
  }

  async rename(userId: string, dayId: string, input: WorkoutDayInput): Promise<WorkoutDay> {
    await this.access.assertDay(userId, dayId);
    const renamed = await this.days.rename(dayId, input);
    if (!renamed) throw dayNotFound(dayId);
    return renamed;
  }

  async delete(userId: string, dayId: string): Promise<void> {
    await this.access.assertDay(userId, dayId);
    if (!(await this.days.delete(dayId))) throw dayNotFound(dayId);
  }

  async reorder(userId: string, routineId: string, orderedIds: readonly string[]): Promise<WorkoutDay[]> {
    const current = await this.listByRoutine(userId, routineId);
    assertSameIds(current.map((day) => day.id), orderedIds, 'INVALID_DAY_ORDER');
    return this.days.reorder(routineId, orderedIds);
  }
}
