import { isSetType, type SetType } from '@gym/shared';
import type {
  DayExercise,
  LoggedSet,
  PlannedSet,
  Routine,
  RoutineSummary,
  WorkoutDay,
  WorkoutSession,
} from '@gym/shared';

// ---- Raw rows as returned by SQLite (snake_case) ----

export interface RoutineRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
export interface RoutineSummaryRow extends RoutineRow {
  day_count: number;
}
export interface DayRow {
  id: string;
  routine_id: string;
  name: string;
  position: number;
}
export interface DayExerciseRow {
  id: string;
  workout_day_id: string;
  name: string;
  notes: string | null;
  position: number;
}
export interface PlannedSetRow {
  id: string;
  day_exercise_id: string;
  set_number: number;
  set_type: string;
  target_rep_min: number;
  target_rep_max: number;
  target_weight: number | null;
  target_rir: number | null;
}
export interface SessionRow {
  id: string;
  workout_day_id: string;
  completed_at: string;
  duration_minutes: number | null;
  notes: string | null;
}
export interface LoggedSetRow {
  id: string;
  session_id: string;
  day_exercise_id: string | null;
  exercise_name: string;
  exercise_position: number;
  set_number: number;
  set_type: string;
  actual_weight: number | null;
  actual_reps: number | null;
  completed: number;
}

// ---- Row -> domain ----

/** The DB CHECK constraint guarantees valid values; this keeps the type honest. */
function toSetType(value: string): SetType {
  if (!isSetType(value)) throw new Error(`Unknown set_type in database: ${value}`);
  return value;
}

export function toRoutine(row: RoutineRow): Routine {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toRoutineSummary(row: RoutineSummaryRow): RoutineSummary {
  return { ...toRoutine(row), dayCount: row.day_count };
}

export function toPlannedSet(row: PlannedSetRow): PlannedSet {
  return {
    id: row.id,
    setNumber: row.set_number,
    setType: toSetType(row.set_type),
    targetRepMin: row.target_rep_min,
    targetRepMax: row.target_rep_max,
    targetWeight: row.target_weight,
    targetRir: row.target_rir,
  };
}

export function toDayExercise(row: DayExerciseRow, sets: PlannedSet[]): DayExercise {
  return {
    id: row.id,
    workoutDayId: row.workout_day_id,
    name: row.name,
    notes: row.notes,
    order: row.position,
    sets,
  };
}

export function toWorkoutDay(row: DayRow, exercises: DayExercise[]): WorkoutDay {
  return { id: row.id, routineId: row.routine_id, name: row.name, order: row.position, exercises };
}

export function toLoggedSet(row: LoggedSetRow): LoggedSet {
  return {
    id: row.id,
    dayExerciseId: row.day_exercise_id,
    exerciseName: row.exercise_name,
    exerciseOrder: row.exercise_position,
    setNumber: row.set_number,
    setType: toSetType(row.set_type),
    actualWeight: row.actual_weight,
    actualReps: row.actual_reps,
    completed: row.completed === 1,
  };
}

export function toSession(row: SessionRow, sets: LoggedSet[]): WorkoutSession {
  return {
    id: row.id,
    workoutDayId: row.workout_day_id,
    completedAt: row.completed_at,
    durationMinutes: row.duration_minutes,
    notes: row.notes,
    sets,
  };
}

/** Groups rows by a key, keeping their original order. */
export function groupBy<T>(rows: T[], keyOf: (row: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  rows.forEach((row) => {
    const key = keyOf(row);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });
  return groups;
}
