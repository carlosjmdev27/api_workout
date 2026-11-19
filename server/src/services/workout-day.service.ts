import { LIMITS, type WorkoutDay, type WorkoutDayDetail, type WorkoutDayInput } from '@gym/shared';
import type { WorkoutDayRepository } from '../repositories/workout-day.repository.js';
import { assertSameIds, dayNotFound, limitReached } from './errors.js';
import type { RoutineService } from './routine.service.js';

/** Business logic for the workout days ("tablas") of a routine. */
export class WorkoutDayService {
  private readonly days: WorkoutDayRepository;
  private readonly routines: RoutineService;

  constructor(days: WorkoutDayRepository, routines: RoutineService) {
    this.days = days;
    this.routines = routines;
  }

  async listByRoutine(routineId: string): Promise<WorkoutDay[]> {
    await this.routines.assertExists(routineId);
    return this.days.findByRoutine(routineId);
  }

  async getById(dayId: string): Promise<WorkoutDayDetail> {
    const day = await this.days.findById(dayId);
    if (!day) throw dayNotFound(dayId);
    return day;
  }

  async create(routineId: string, input: WorkoutDayInput): Promise<WorkoutDay> {
    const current = await this.listByRoutine(routineId);
    if (current.length >= LIMITS.DAYS_PER_ROUTINE_MAX) {
      throw limitReached('DAY_LIMIT_REACHED', 'workout days per routine', LIMITS.DAYS_PER_ROUTINE_MAX);
    }
    return this.days.create(routineId, input);
  }

  async rename(dayId: string, input: WorkoutDayInput): Promise<WorkoutDay> {
    const renamed = await this.days.rename(dayId, input);
    if (!renamed) throw dayNotFound(dayId);
    return renamed;
  }

  async delete(dayId: string): Promise<void> {
    if (!(await this.days.delete(dayId))) throw dayNotFound(dayId);
  }

  async reorder(routineId: string, orderedIds: readonly string[]): Promise<WorkoutDay[]> {
    const current = await this.listByRoutine(routineId);
    assertSameIds(current.map((day) => day.id), orderedIds, 'INVALID_DAY_ORDER');
    return this.days.reorder(routineId, orderedIds);
  }
}
