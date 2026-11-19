import { randomUUID } from 'node:crypto';
import type { Database, Statement } from 'better-sqlite3';
import type { DayExercise, DayExerciseInput, DayExerciseUpdate } from '@gym/shared';
import type { DayExerciseRepository } from '../day-exercise.repository.js';
import { PlannedSetWriter } from './planned-set.writer.js';
import { RoutineToucher } from './routine-toucher.js';
import type { DayExerciseRow } from './rows.js';
import { TreeReader } from './tree-reader.js';

interface ExerciseWriteParams {
  id: string;
  catalogId: string | null;
  name: string;
  notes: string | null;
}

interface ExerciseStatements {
  findRow: Statement<[string], DayExerciseRow>;
  nextPosition: Statement<[string], { next: number }>;
  insert: Statement<ExerciseWriteParams & { dayId: string; position: number }>;
  update: Statement<ExerciseWriteParams>;
  delete: Statement<[string]>;
  closeGap: Statement<[string, number]>;
  setPosition: Statement<[number, string, string]>;
}

export class SqliteDayExerciseRepository implements DayExerciseRepository {
  private readonly db: Database;
  private readonly stmt: ExerciseStatements;
  private readonly tree: TreeReader;
  private readonly sets: PlannedSetWriter;
  private readonly touch: RoutineToucher;

  constructor(db: Database) {
    this.db = db;
    this.tree = new TreeReader(db);
    this.sets = new PlannedSetWriter(db);
    this.touch = new RoutineToucher(db);
    this.stmt = {
      findRow: db.prepare(
        'SELECT id, workout_day_id, catalog_exercise_id, name, notes, position FROM day_exercises WHERE id = ?',
      ),
      nextPosition: db.prepare(
        'SELECT COALESCE(MAX(position), 0) + 1 AS next FROM day_exercises WHERE workout_day_id = ?',
      ),
      insert: db.prepare(`
        INSERT INTO day_exercises (id, workout_day_id, catalog_exercise_id, name, notes, position)
        VALUES (@id, @dayId, @catalogId, @name, @notes, @position)`),
      update: db.prepare(
        'UPDATE day_exercises SET catalog_exercise_id = @catalogId, name = @name, notes = @notes WHERE id = @id',
      ),
      delete: db.prepare('DELETE FROM day_exercises WHERE id = ?'),
      closeGap: db.prepare(
        'UPDATE day_exercises SET position = position - 1 WHERE workout_day_id = ? AND position > ?',
      ),
      setPosition: db.prepare(
        'UPDATE day_exercises SET position = ? WHERE workout_day_id = ? AND id = ?',
      ),
    };
  }

  async findById(exerciseId: string): Promise<DayExercise | null> {
    return this.tree.exercise(exerciseId);
  }

  async create(dayId: string, input: DayExerciseInput): Promise<DayExercise> {
    return this.db.transaction((): DayExercise => {
      const id = randomUUID();
      const position = this.stmt.nextPosition.get(dayId)?.next ?? 1;
      this.stmt.insert.run({
        id,
        dayId,
        catalogId: input.catalogExerciseId ?? null,
        name: input.name,
        notes: input.notes ?? null,
        position,
      });
      this.sets.replace(id, input.sets);
      this.touch.day(dayId);
      return this.getExercise(id);
    })();
  }

  async update(exerciseId: string, input: DayExerciseUpdate): Promise<DayExercise | null> {
    return this.db.transaction((): DayExercise | null => {
      const current = this.stmt.findRow.get(exerciseId);
      if (!current) return null;

      this.stmt.update.run({
        id: exerciseId,
        catalogId:
          input.catalogExerciseId === undefined ? current.catalog_exercise_id : input.catalogExerciseId,
        name: input.name ?? current.name,
        notes: input.notes === undefined ? current.notes : input.notes,
      });
      if (input.sets) this.sets.replace(exerciseId, input.sets);
      this.touch.day(current.workout_day_id);
      return this.getExercise(exerciseId);
    })();
  }

  async delete(exerciseId: string): Promise<boolean> {
    return this.db.transaction((): boolean => {
      const current = this.stmt.findRow.get(exerciseId);
      if (!current) return false;
      this.stmt.delete.run(exerciseId); // Cascades to planned sets; logs keep a snapshot.
      this.stmt.closeGap.run(current.workout_day_id, current.position);
      this.touch.day(current.workout_day_id);
      return true;
    })();
  }

  async reorder(dayId: string, orderedIds: readonly string[]): Promise<DayExercise[]> {
    return this.db.transaction((): DayExercise[] => {
      orderedIds.forEach((id, index) => this.stmt.setPosition.run(index + 1, dayId, id));
      this.touch.day(dayId);
      return this.tree.day(dayId)?.exercises ?? [];
    })();
  }

  private getExercise(exerciseId: string): DayExercise {
    const exercise = this.tree.exercise(exerciseId);
    if (!exercise) throw new Error(`Exercise ${exerciseId} not found inside its own transaction`);
    return exercise;
  }
}
