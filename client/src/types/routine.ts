// Mirrors server/src/types/routine.types.ts (API contract).
import type { Exercise, ExerciseInput } from './exercise';

export interface Routine {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineSummary extends Routine {
  exerciseCount: number;
}

export interface RoutineWithExercises extends Routine {
  exercises: Exercise[];
}

export interface CreateRoutineInput {
  name: string;
  description: string | null;
  exercises: ExerciseInput[];
}

export interface UpdateRoutineInput {
  name?: string;
  description?: string | null;
}
