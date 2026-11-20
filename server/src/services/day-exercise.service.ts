import {
  LIMITS,
  type DayExercise,
  type DayExerciseInput,
  type DayExerciseUpdate,
} from '@gym/shared';
import type { DayExerciseRepository } from '../repositories/day-exercise.repository.js';
import type { AccessGuard } from './access.guard.js';
import type { CatalogService } from './catalog.service.js';
import { assertSameIds, exerciseNotFound, limitReached } from './errors.js';
import type { WorkoutDayService } from './workout-day.service.js';

/** Business logic for the exercises of a workout day and their planned sets. Scoped to a user. */
export class DayExerciseService {
  private readonly exercises: DayExerciseRepository;
  private readonly days: WorkoutDayService;
  private readonly catalog: CatalogService;
  private readonly access: AccessGuard;

  constructor(exercises: DayExerciseRepository, days: WorkoutDayService, catalog: CatalogService, access: AccessGuard) {
    this.exercises = exercises;
    this.days = days;
    this.catalog = catalog;
    this.access = access;
  }

  async create(userId: string, dayId: string, input: DayExerciseInput): Promise<DayExercise> {
    const day = await this.days.getById(userId, dayId);
    if (day.exercises.length >= LIMITS.EXERCISES_PER_DAY_MAX) {
      throw limitReached('EXERCISE_LIMIT_REACHED', 'exercises per day', LIMITS.EXERCISES_PER_DAY_MAX);
    }
    if (input.catalogExerciseId) await this.catalog.assertVisible(userId, input.catalogExerciseId);
    return this.exercises.create(dayId, input);
  }

  async update(userId: string, exerciseId: string, input: DayExerciseUpdate): Promise<DayExercise> {
    await this.access.assertExercise(userId, exerciseId);
    if (input.catalogExerciseId) await this.catalog.assertVisible(userId, input.catalogExerciseId);
    const updated = await this.exercises.update(exerciseId, input);
    if (!updated) throw exerciseNotFound(exerciseId);
    return updated;
  }

  async delete(userId: string, exerciseId: string): Promise<void> {
    await this.access.assertExercise(userId, exerciseId);
    if (!(await this.exercises.delete(exerciseId))) throw exerciseNotFound(exerciseId);
  }

  async reorder(userId: string, dayId: string, orderedIds: readonly string[]): Promise<DayExercise[]> {
    const day = await this.days.getById(userId, dayId);
    assertSameIds(day.exercises.map((exercise) => exercise.id), orderedIds, 'INVALID_EXERCISE_ORDER');
    return this.exercises.reorder(dayId, orderedIds);
  }
}
