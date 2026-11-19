import type { CatalogExercise, CatalogExerciseInput, MuscleGroup } from '@gym/shared';

/** Persistence contract for the exercise catalog. */
export interface CatalogRepository {
  /** Whole catalog (or one muscle group), alphabetical. Text matching is done by the service. */
  list(muscleGroup?: MuscleGroup): Promise<CatalogExercise[]>;
  findById(id: string): Promise<CatalogExercise | null>;
  /**
   * Creates a custom exercise (is_custom = true). Returns null when the
   * normalized name already exists (enforced atomically by the UNIQUE index).
   */
  createCustom(input: CatalogExerciseInput, normalizedName: string): Promise<CatalogExercise | null>;
}
