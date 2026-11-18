import type { Exercise, ExerciseInput, ExerciseUpdate } from '../types/exercise.types.js';

/** Persistence contract for the exercises of a routine. */
export interface ExerciseRepository {
  /** Exercises of a routine sorted by `order`. */
  findByRoutineId(routineId: string): Promise<Exercise[]>;
  /** Appends the exercise at the end of the routine. */
  create(routineId: string, input: ExerciseInput): Promise<Exercise>;
  update(routineId: string, exerciseId: string, input: ExerciseUpdate): Promise<Exercise | null>;
  /** Deletes the exercise and closes the gap in `order`. */
  delete(routineId: string, exerciseId: string): Promise<boolean>;
  /** Sets `order` following `orderedIds` (must contain every exercise). */
  reorder(routineId: string, orderedIds: readonly string[]): Promise<Exercise[]>;
}
