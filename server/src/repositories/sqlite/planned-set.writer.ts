import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import type { PlannedSetInput } from '@gym/shared';

interface PlannedSetParams {
  id: string;
  exerciseId: string;
  setNumber: number;
  setType: string;
  repMin: number;
  repMax: number;
  weight: number | null;
  rir: number | null;
}

/**
 * Writes the planned sets of an exercise. Sets are always replaced as a
 * whole, numbered 1..n from their position. Call inside a transaction.
 */
export class PlannedSetWriter {
  private readonly insert: Statement<PlannedSetParams>;
  private readonly deleteAll: Statement<[string]>;

  constructor(db: Database) {
    this.insert = db.prepare(`
      INSERT INTO planned_sets (id, day_exercise_id, set_number, set_type,
        target_rep_min, target_rep_max, target_weight, target_rir)
      VALUES (@id, @exerciseId, @setNumber, @setType, @repMin, @repMax, @weight, @rir)`);
    this.deleteAll = db.prepare('DELETE FROM planned_sets WHERE day_exercise_id = ?');
  }

  replace(exerciseId: string, sets: readonly PlannedSetInput[]): void {
    this.deleteAll.run(exerciseId);
    sets.forEach((set, index) => {
      this.insert.run({
        id: randomUUID(),
        exerciseId,
        setNumber: index + 1,
        setType: set.setType,
        repMin: set.targetRepMin,
        repMax: set.targetRepMax,
        weight: set.targetWeight ?? null,
        rir: set.targetRir ?? null,
      });
    });
  }
}
