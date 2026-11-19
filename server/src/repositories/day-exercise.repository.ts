import type { DayExercise, DayExerciseInput, DayExerciseUpdate } from '@gym/shared';

/** Persistence contract for the exercises of a workout day and their planned sets. */
export interface DayExerciseRepository {
  findById(exerciseId: string): Promise<DayExercise | null>;
  /** Appends the exercise (with its sets) at the end of the day, atomically. */
  create(dayId: string, input: DayExerciseInput): Promise<DayExercise>;
  /** Partial update; if `sets` is present all planned sets are replaced atomically. */
  update(exerciseId: string, input: DayExerciseUpdate): Promise<DayExercise | null>;
  /** Deletes the exercise and closes the gap in `order`. */
  delete(exerciseId: string): Promise<boolean>;
  reorder(dayId: string, orderedIds: readonly string[]): Promise<DayExercise[]>;
}
