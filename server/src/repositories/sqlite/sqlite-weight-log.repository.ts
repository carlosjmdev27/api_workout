import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import { DEFAULT_WEIGHT_UNIT, convertWeight, isWeightUnit, type WeightLog } from '@gym/shared';
import type { NewWeightLog, WeightLogRepository } from '../weight-log.repository.js';

interface LogRow {
  id: string;
  weight: number;
  unit: string;
  recorded_at: string;
}

const toLog = (row: LogRow): WeightLog => ({
  id: row.id,
  weight: row.weight,
  unit: isWeightUnit(row.unit) ? row.unit : DEFAULT_WEIGHT_UNIT,
  recordedAt: row.recorded_at,
});

export class SqliteWeightLogRepository implements WeightLogRepository {
  private readonly db: Database;
  private readonly stmt: {
    list: Statement<{ userId: string; limit: number }, LogRow>;
    insert: Statement<LogRow & { userId: string }>;
    remove: Statement<{ id: string; userId: string }>;
    latest: Statement<[string], LogRow>;
    userUnit: Statement<[string], { weight_unit: string }>;
    setCurrent: Statement<{ userId: string; weight: number | null }>;
  };

  constructor(db: Database) {
    this.db = db;
    this.stmt = {
      list: db.prepare(
        `SELECT id, weight, unit, recorded_at FROM body_weight_logs
         WHERE user_id = @userId ORDER BY recorded_at DESC LIMIT @limit`,
      ),
      insert: db.prepare(
        'INSERT INTO body_weight_logs (id, user_id, weight, unit, recorded_at) VALUES (@id, @userId, @weight, @unit, @recorded_at)',
      ),
      // user_id in the WHERE: nobody can delete another user's entry by guessing its id.
      remove: db.prepare('DELETE FROM body_weight_logs WHERE id = @id AND user_id = @userId'),
      latest: db.prepare(
        'SELECT id, weight, unit, recorded_at FROM body_weight_logs WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1',
      ),
      userUnit: db.prepare('SELECT weight_unit FROM users WHERE id = ?'),
      setCurrent: db.prepare('UPDATE users SET body_weight = @weight WHERE id = @userId'),
    };
  }

  async listByUser(userId: string, limit: number): Promise<WeightLog[]> {
    return this.stmt.list.all({ userId, limit }).reverse().map(toLog);
  }

  async create(userId: string, log: NewWeightLog): Promise<WeightLog> {
    const row: LogRow = { id: randomUUID(), weight: log.weight, unit: log.unit, recorded_at: log.recordedAt };
    this.db.transaction(() => {
      this.stmt.insert.run({ ...row, userId });
      this.refreshCurrent(userId);
    })();
    return toLog(row);
  }

  async deleteOwned(userId: string, logId: string): Promise<boolean> {
    return this.db.transaction((): boolean => {
      if (this.stmt.remove.run({ id: logId, userId }).changes === 0) return false;
      this.refreshCurrent(userId);
      return true;
    })();
  }

  async refreshCurrentWeight(userId: string): Promise<void> {
    this.db.transaction(() => this.refreshCurrent(userId))();
  }

  /** users.body_weight = newest entry, in the user's unit (display conversion; logs stay as recorded). */
  private refreshCurrent(userId: string): void {
    const latest = this.stmt.latest.get(userId);
    const unitRow = this.stmt.userUnit.get(userId);
    const userUnit = unitRow && isWeightUnit(unitRow.weight_unit) ? unitRow.weight_unit : DEFAULT_WEIGHT_UNIT;
    const converted = latest ? convertWeight(latest.weight, isWeightUnit(latest.unit) ? latest.unit : userUnit, userUnit) : null;
    // users.body_weight keeps its 20-500 CHECK: an extreme value that leaves the range once
    // converted (e.g. 300 kg -> 661 lb) is left unset rather than failing the whole request.
    const weight = converted !== null && converted >= 20 && converted <= 500 ? converted : null;
    this.stmt.setCurrent.run({ userId, weight });
  }
}
