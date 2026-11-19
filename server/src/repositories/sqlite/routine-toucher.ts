import type { Database, Statement } from 'better-sqlite3';

/** Refreshes routines.updated_at whenever something inside the routine changes. */
export class RoutineToucher {
  private readonly byRoutine: Statement<[string, string]>;
  private readonly byDay: Statement<[string, string]>;

  constructor(db: Database) {
    this.byRoutine = db.prepare('UPDATE routines SET updated_at = ? WHERE id = ?');
    this.byDay = db.prepare(
      'UPDATE routines SET updated_at = ? WHERE id = (SELECT routine_id FROM workout_days WHERE id = ?)',
    );
  }

  routine(routineId: string): void {
    this.byRoutine.run(new Date().toISOString(), routineId);
  }

  day(dayId: string): void {
    this.byDay.run(new Date().toISOString(), dayId);
  }
}
