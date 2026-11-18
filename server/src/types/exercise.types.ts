/** Exercise inside a routine, as exposed by the API. */
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

/** Data needed to create an exercise. `order` is assigned by the system. */
export interface ExerciseInput {
  name: string;
  sets: number;
  reps: string;
  weight?: number | null | undefined;
  restSeconds?: number | null | undefined;
  notes?: string | null | undefined;
}

/** Partial update: `undefined` keeps the value, `null` clears optional fields. */
export type ExerciseUpdate = {
  [K in keyof ExerciseInput]?: ExerciseInput[K] | undefined;
};
