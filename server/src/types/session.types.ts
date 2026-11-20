import type { SetType } from '@gym/shared';

/**
 * A session ready to be persisted: the service has already validated it,
 * computed its duration and resolved each set's exercise name/order snapshot.
 * Only completed sets are recorded.
 */
export interface NewLoggedSetRecord {
  dayExerciseId: string;
  exerciseName: string;
  exerciseOrder: number;
  setNumber: number;
  setType: SetType;
  actualWeight: number | null;
  actualReps: number;
}

export interface NewSessionRecord {
  /** Owner (taken from the token, never from the request body). */
  userId: string;
  workoutDayId: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  notes: string | null;
  sets: NewLoggedSetRecord[];
}
