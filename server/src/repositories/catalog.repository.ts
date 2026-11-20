import type { CatalogExercise, CatalogExerciseInput, MuscleGroup } from '@gym/shared';

/**
 * Persistence contract for the exercise catalog. A user sees the base exercises
 * plus their own custom ones, never another user's.
 */
export interface CatalogRepository {
  /** Visible catalog (or one muscle group), alphabetical. Text matching is done by the service. */
  list(userId: string, muscleGroup?: MuscleGroup): Promise<CatalogExercise[]>;
  /** The entry, only if this user can see it. */
  findVisible(userId: string, id: string): Promise<CatalogExercise | null>;
  /**
   * Creates a custom exercise for the user. Returns null when the normalized name
   * already exists in the base list or among this user's exercises (checked atomically).
   */
  createCustom(userId: string, input: CatalogExerciseInput, normalizedName: string): Promise<CatalogExercise | null>;
}
