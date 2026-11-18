// DUPLICATED in client/src/types/routine.ts — keep both in sync (PROJECT_DOC pending #1).
import type { Exercise, ExerciseInput } from './exercise.types.js';

export interface Routine {
  id: string;
  name: string;
  description: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Routine as shown in listings. */
export interface RoutineSummary extends Routine {
  exerciseCount: number;
}

/** Routine with its exercises sorted by `order`. */
export interface RoutineWithExercises extends Routine {
  exercises: Exercise[];
}

export interface CreateRoutineInput {
  name: string;
  description?: string | null | undefined;
  exercises?: ExerciseInput[] | undefined;
}

/** Partial update: `undefined` keeps the value, `null` clears the description. */
export interface UpdateRoutineInput {
  name?: string | undefined;
  description?: string | null | undefined;
}
