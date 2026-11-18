import { LIMITS } from '../config/limits.js';
import { BusinessRuleError, NotFoundError } from '../errors/app-error.js';
import type { ExerciseRepository } from '../repositories/exercise.repository.js';
import type { RoutineRepository } from '../repositories/routine.repository.js';
import type { Exercise, ExerciseInput, ExerciseUpdate } from '../types/exercise.types.js';
import { routineNotFound } from './routine.service.js';

function exerciseNotFound(id: string): NotFoundError {
  return new NotFoundError('EXERCISE_NOT_FOUND', `Exercise ${id} not found in this routine`);
}

/** Business logic for the exercises of a routine. */
export class ExerciseService {
  private readonly exercises: ExerciseRepository;
  private readonly routines: RoutineRepository;

  constructor(exercises: ExerciseRepository, routines: RoutineRepository) {
    this.exercises = exercises;
    this.routines = routines;
  }

  async list(routineId: string): Promise<Exercise[]> {
    await this.assertRoutineExists(routineId);
    return this.exercises.findByRoutineId(routineId);
  }

  async create(routineId: string, input: ExerciseInput): Promise<Exercise> {
    const current = await this.list(routineId);
    if (current.length >= LIMITS.EXERCISES_PER_ROUTINE_MAX) {
      throw new BusinessRuleError(
        'EXERCISE_LIMIT_REACHED',
        `A routine cannot have more than ${LIMITS.EXERCISES_PER_ROUTINE_MAX} exercises`,
      );
    }
    return this.exercises.create(routineId, input);
  }

  async update(routineId: string, exerciseId: string, input: ExerciseUpdate): Promise<Exercise> {
    await this.assertRoutineExists(routineId);
    const updated = await this.exercises.update(routineId, exerciseId, input);
    if (!updated) throw exerciseNotFound(exerciseId);
    return updated;
  }

  async delete(routineId: string, exerciseId: string): Promise<void> {
    await this.assertRoutineExists(routineId);
    const deleted = await this.exercises.delete(routineId, exerciseId);
    if (!deleted) throw exerciseNotFound(exerciseId);
  }

  /** `orderedIds` must contain exactly the current exercises of the routine. */
  async reorder(routineId: string, orderedIds: readonly string[]): Promise<Exercise[]> {
    const current = await this.list(routineId);
    const currentIds = new Set(current.map((exercise) => exercise.id));
    const isSameSet =
      orderedIds.length === currentIds.size && orderedIds.every((id) => currentIds.has(id));

    if (!isSameSet) {
      throw new BusinessRuleError(
        'INVALID_EXERCISE_ORDER',
        'exerciseIds must contain every exercise of the routine exactly once',
      );
    }
    return this.exercises.reorder(routineId, orderedIds);
  }

  private async assertRoutineExists(routineId: string): Promise<void> {
    if (!(await this.routines.exists(routineId))) throw routineNotFound(routineId);
  }
}
