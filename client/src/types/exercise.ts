// Mirrors server/src/types/exercise.types.ts (API contract).

export interface Exercise {
  id: string;
  routineId: string;
  name: string;
  sets: number;
  reps: string;
  weight: number | null;
  restSeconds: number | null;
  notes: string | null;
  order: number;
}

export interface ExerciseInput {
  name: string;
  sets: number;
  reps: string;
  weight: number | null;
  restSeconds: number | null;
  notes: string | null;
}

export type ExerciseUpdate = Partial<ExerciseInput>;
