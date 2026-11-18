import { randomUUID } from 'node:crypto';
import type { Exercise, ExerciseInput } from '../../types/exercise.types.js';
import type { Routine, RoutineSummary } from '../../types/routine.types.js';

// ---- Raw rows as returned by SQLite (snake_case) ----

export interface RoutineRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoutineSummaryRow extends RoutineRow {
  exercise_count: number;
}

export interface ExerciseRow {
  id: string;
  routine_id: string;
  name: string;
  sets: number;
  reps: string;
  weight: number | null;
  rest_seconds: number | null;
  notes: string | null;
  position: number;
}

/** Named parameters for INSERT/UPDATE of an exercise. */
export interface ExerciseParams {
  id: string;
  routineId: string;
  name: string;
  sets: number;
  reps: string;
  weight: number | null;
  restSeconds: number | null;
  notes: string | null;
  position: number;
}

export const ROUTINE_COLUMNS = 'id, name, description, created_at, updated_at';
export const EXERCISE_COLUMNS =
  'id, routine_id, name, sets, reps, weight, rest_seconds, notes, position';

export const INSERT_EXERCISE_SQL = `
  INSERT INTO exercises (${EXERCISE_COLUMNS})
  VALUES (@id, @routineId, @name, @sets, @reps, @weight, @restSeconds, @notes, @position)`;

// ---- Row -> domain ----

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
  return { ...toRoutine(row), exerciseCount: row.exercise_count };
}

export function toExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    routineId: row.routine_id,
    name: row.name,
    sets: row.sets,
    reps: row.reps,
    weight: row.weight,
    restSeconds: row.rest_seconds,
    notes: row.notes,
    order: row.position,
  };
}

// ---- Domain input -> SQL parameters ----

export function toNewExerciseParams(
  routineId: string,
  input: ExerciseInput,
  position: number,
): ExerciseParams {
  return {
    id: randomUUID(),
    routineId,
    name: input.name,
    sets: input.sets,
    reps: input.reps,
    weight: input.weight ?? null,
    restSeconds: input.restSeconds ?? null,
    notes: input.notes ?? null,
    position,
  };
}

/** `undefined` keeps the current value; anything else (including null) replaces it. */
export function pick<T>(next: T | undefined, current: T): T {
  return next === undefined ? current : next;
}
