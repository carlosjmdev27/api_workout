import type { SetType } from '../set-types.js';

/** Entities as returned by the API (camelCase; the DB uses snake_case). */

export interface Routine {
  id: string;
  name: string;
  description: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface RoutineSummary extends Routine {
  dayCount: number;
}

export interface PlannedSet {
  id: string;
  setNumber: number;
  setType: SetType;
  targetRepMin: number;
  targetRepMax: number;
  targetWeight: number | null;
  targetRir: number | null;
}

export interface DayExercise {
  id: string;
  workoutDayId: string;
  name: string;
  notes: string | null;
  order: number;
  sets: PlannedSet[];
}

/** A "tabla": one training day inside a routine. */
export interface WorkoutDay {
  id: string;
  routineId: string;
  name: string;
  order: number;
  exercises: DayExercise[];
}

export interface RoutineDetail extends Routine {
  days: WorkoutDay[];
}

/** Day plus its routine name, enough to render the workout screen alone. */
export interface WorkoutDayDetail extends WorkoutDay {
  routineName: string;
}

export interface LoggedSet {
  id: string;
  /** null if the exercise was later removed from the template. */
  dayExerciseId: string | null;
  /** Snapshot taken when the session was saved, so history survives template edits. */
  exerciseName: string;
  exerciseOrder: number;
  setNumber: number;
  setType: SetType;
  actualWeight: number | null;
  actualReps: number | null;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  workoutDayId: string;
  /** null only for sessions saved before v3 (no start time was recorded). */
  startedAt: string | null; // ISO 8601
  completedAt: string; // ISO 8601
  /** Computed by the server: completedAt - startedAt. */
  durationSeconds: number | null;
  notes: string | null;
  sets: LoggedSet[];
}

/** A session plus the names needed to show it on its own page (summary). */
export interface WorkoutSessionDetail extends WorkoutSession {
  dayName: string;
  routineId: string;
  routineName: string;
}
