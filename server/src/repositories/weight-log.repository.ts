import type { WeightLog, WeightUnit } from '@gym/shared';

export interface NewWeightLog {
  weight: number;
  unit: WeightUnit;
  /** ISO 8601. */
  recordedAt: string;
}

/** Body weight history. Every method is scoped to its owner (userId). */
export interface WeightLogRepository {
  /** Oldest -> newest (chart order); at most the `limit` most recent entries. */
  listByUser(userId: string, limit: number): Promise<WeightLog[]>;
  /**
   * Adds a weigh-in and, in the same transaction, refreshes users.body_weight with the
   * most recent entry (by recordedAt), shown in the user's current unit.
   */
  create(userId: string, log: NewWeightLog): Promise<WeightLog>;
  /** Deletes one of the user's own entries (false if it does not exist or is someone else's), then refreshes the current weight. */
  deleteOwned(userId: string, logId: string): Promise<boolean>;
  /** Recomputes users.body_weight from the newest entry (e.g. after the preferred unit changed). */
  refreshCurrentWeight(userId: string): Promise<void>;
}
