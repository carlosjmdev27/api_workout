import type { WorkoutDay, WorkoutDayDetail, WorkoutDayInput } from '@gym/shared';

/** Persistence contract for the workout days ("tablas") of a routine. */
export interface WorkoutDayRepository {
  /** Days of a routine sorted by `order`, each with exercises and sets. */
  findByRoutine(routineId: string): Promise<WorkoutDay[]>;
  findById(dayId: string): Promise<WorkoutDayDetail | null>;
  /** Appends the day at the end of the routine. */
  create(routineId: string, input: WorkoutDayInput): Promise<WorkoutDay>;
  rename(dayId: string, input: WorkoutDayInput): Promise<WorkoutDay | null>;
  /** Deletes the day (with its exercises and history) and closes the gap in `order`. */
  delete(dayId: string): Promise<boolean>;
  reorder(routineId: string, orderedIds: readonly string[]): Promise<WorkoutDay[]>;
}
