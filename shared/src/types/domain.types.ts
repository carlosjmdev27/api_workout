import type { Equipment, MuscleGroup } from '../catalog.js';
import type { SetType } from '../set-types.js';
import type { CountryCode } from '../countries.js';
import type { WeightUnit } from '../weight-units.js';

/** One weigh-in of the body weight history, in the unit it was recorded with. */
export interface WeightLog {
  id: string;
  weight: number;
  unit: WeightUnit;
  recordedAt: string; // ISO 8601
}

/** Entry of the exercise catalog (base list or created by the user). */
export interface CatalogExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment | null;
  isCustom: boolean;
}

/** Account as exposed by the API (never includes the password hash). */
export interface User {
  id: string;
  email: string;
  /** Unique login name (lowercase); the login accepts it or the email. */
  username: string;
  name: string;
  lastName: string | null;
  /** ISO 3166-1 alpha-2 (e.g. "ES"). */
  country: CountryCode | null;
  /** YYYY-MM-DD. */
  birthDate: string | null;
  heightCm: number | null;
  createdAt: string;
  /** Current body weight in `weightUnit`, or null if not set. */
  bodyWeight: number | null;
  /** Unit of every weight the user types and sees (no conversion of stored values). */
  weightUnit: WeightUnit;
}

/**
 * Answer of register (never a session).
 * - verificationRequired true: confirm the email first; `emailSent` false = the account
 *   exists but the email failed (the user can ask again).
 * - verificationRequired false: the account is ready, the user can log in now.
 */
export interface RegisterResponse {
  email: string;
  emailSent: boolean;
  verificationRequired: boolean;
}

/** Answer of login. */
export interface AuthResponse {
  token: string;
  user: User;
}

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
  /** Link to the catalog (null for free-text or pre-v4 exercises). */
  catalogExerciseId: string | null;
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
