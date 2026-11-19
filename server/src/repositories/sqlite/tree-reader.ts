import type { Database, Statement } from 'better-sqlite3';
import type { DayExercise, WorkoutDay } from '@gym/shared';
import {
  groupBy,
  toDayExercise,
  toPlannedSet,
  toWorkoutDay,
  type DayExerciseRow,
  type DayRow,
  type PlannedSetRow,
} from './rows.js';

const DAY_COLS = 'd.id, d.routine_id, d.name, d.position';
const EXERCISE_COLS = 'e.id, e.workout_day_id, e.catalog_exercise_id, e.name, e.notes, e.position';
const SET_COLS =
  's.id, s.day_exercise_id, s.set_number, s.set_type, s.target_rep_min, s.target_rep_max, s.target_weight, s.target_rir';

interface TreeStatements {
  daysByRoutine: Statement<[string], DayRow>;
  dayById: Statement<[string], DayRow>;
  exercisesByRoutine: Statement<[string], DayExerciseRow>;
  exercisesByDay: Statement<[string], DayExerciseRow>;
  exerciseById: Statement<[string], DayExerciseRow>;
  setsByRoutine: Statement<[string], PlannedSetRow>;
  setsByDay: Statement<[string], PlannedSetRow>;
  setsByExercise: Statement<[string], PlannedSetRow>;
}

/**
 * Loads the Routine -> Day -> Exercise -> Set tree with 3 queries per call
 * (one per level) instead of one query per node.
 */
export class TreeReader {
  private readonly stmt: TreeStatements;

  constructor(db: Database) {
    const fromSets = `FROM planned_sets s JOIN day_exercises e ON e.id = s.day_exercise_id`;
    this.stmt = {
      daysByRoutine: db.prepare(`SELECT ${DAY_COLS} FROM workout_days d WHERE d.routine_id = ? ORDER BY d.position`),
      dayById: db.prepare(`SELECT ${DAY_COLS} FROM workout_days d WHERE d.id = ?`),
      exercisesByRoutine: db.prepare(`
        SELECT ${EXERCISE_COLS} FROM day_exercises e
        JOIN workout_days d ON d.id = e.workout_day_id
        WHERE d.routine_id = ? ORDER BY e.position`),
      exercisesByDay: db.prepare(`SELECT ${EXERCISE_COLS} FROM day_exercises e WHERE e.workout_day_id = ? ORDER BY e.position`),
      exerciseById: db.prepare(`SELECT ${EXERCISE_COLS} FROM day_exercises e WHERE e.id = ?`),
      setsByRoutine: db.prepare(`
        SELECT ${SET_COLS} ${fromSets} JOIN workout_days d ON d.id = e.workout_day_id
        WHERE d.routine_id = ? ORDER BY s.set_number`),
      setsByDay: db.prepare(`SELECT ${SET_COLS} ${fromSets} WHERE e.workout_day_id = ? ORDER BY s.set_number`),
      setsByExercise: db.prepare(`SELECT ${SET_COLS} FROM planned_sets s WHERE s.day_exercise_id = ? ORDER BY s.set_number`),
    };
  }

  daysOfRoutine(routineId: string): WorkoutDay[] {
    return this.assemble(
      this.stmt.daysByRoutine.all(routineId),
      this.stmt.exercisesByRoutine.all(routineId),
      this.stmt.setsByRoutine.all(routineId),
    );
  }

  day(dayId: string): WorkoutDay | null {
    const row = this.stmt.dayById.get(dayId);
    if (!row) return null;
    const [day] = this.assemble([row], this.stmt.exercisesByDay.all(dayId), this.stmt.setsByDay.all(dayId));
    return day ?? null;
  }

  exercise(exerciseId: string): DayExercise | null {
    const row = this.stmt.exerciseById.get(exerciseId);
    if (!row) return null;
    return toDayExercise(row, this.stmt.setsByExercise.all(exerciseId).map(toPlannedSet));
  }

  private assemble(days: DayRow[], exercises: DayExerciseRow[], sets: PlannedSetRow[]): WorkoutDay[] {
    const setsByExercise = groupBy(sets, (set) => set.day_exercise_id);
    const exercisesByDay = groupBy(exercises, (exercise) => exercise.workout_day_id);

    return days.map((day) =>
      toWorkoutDay(
        day,
        (exercisesByDay.get(day.id) ?? []).map((exercise) =>
          toDayExercise(exercise, (setsByExercise.get(exercise.id) ?? []).map(toPlannedSet)),
        ),
      ),
    );
  }
}
