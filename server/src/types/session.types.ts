import type { SetType } from '@gym/shared';

/**
 * A session ready to be persisted: the service has already validated it
 * and resolved each set's exercise name/order snapshot from the template.
 */
export interface NewLoggedSetRecord {
  dayExerciseId: string;
  exerciseName: string;
  exerciseOrder: number;
  setNumber: number;
  setType: SetType;
  actualWeight: number | null;
  actualReps: number | null;
  completed: boolean;
}

export interface NewSessionRecord {
  workoutDayId: string;
  completedAt: string;
  durationMinutes: number | null;
  notes: string | null;
  sets: NewLoggedSetRecord[];
}
