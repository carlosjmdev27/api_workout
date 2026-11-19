import {
  LIMITS,
  type DayExercise,
  type DayExerciseInput,
  type DayExerciseUpdate,
} from '@gym/shared';
import type { DayExerciseRepository } from '../repositories/day-exercise.repository.js';
import { assertSameIds, exerciseNotFound, limitReached } from './errors.js';
import type { WorkoutDayService } from './workout-day.service.js';

/** Business logic for the exercises of a workout day and their planned sets. */
export class DayExerciseService {
  private readonly exercises: DayExerciseRepository;
  private readonly days: WorkoutDayService;

  constructor(exercises: DayExerciseRepository, days: WorkoutDayService) {
    this.exercises = exercises;
    this.days = days;
  }

  async create(dayId: string, input: DayExerciseInput): Promise<DayExercise> {
    const day = await this.days.getById(dayId);
    if (day.exercises.length >= LIMITS.EXERCISES_PER_DAY_MAX) {
      throw limitReached('EXERCISE_LIMIT_REACHED', 'exercises per day', LIMITS.EXERCISES_PER_DAY_MAX);
    }
    return this.exercises.create(dayId, input);
  }

  async update(exerciseId: string, input: DayExerciseUpdate): Promise<DayExercise> {
    const updated = await this.exercises.update(exerciseId, input);
    if (!updated) throw exerciseNotFound(exerciseId);
    return updated;
  }

  async delete(exerciseId: string): Promise<void> {
    if (!(await this.exercises.delete(exerciseId))) throw exerciseNotFound(exerciseId);
  }

  async reorder(dayId: string, orderedIds: readonly string[]): Promise<DayExercise[]> {
    const day = await this.days.getById(dayId);
    assertSameIds(day.exercises.map((exercise) => exercise.id), orderedIds, 'INVALID_EXERCISE_ORDER');
    return this.exercises.reorder(dayId, orderedIds);
  }
}
