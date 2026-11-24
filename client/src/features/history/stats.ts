import type { LoggedSet, WorkoutSession } from '@gym/shared';

/** A set counts for stats when it was completed and has reps. */
const isDone = (set: LoggedSet): boolean => set.completed && set.actualReps !== null;

export interface SessionTotals {
  completedSets: number;
  totalReps: number;
  /** Weight moved: Σ weight × reps of completed sets (user's unit). */
  volume: number;
}

export function sessionTotals(session: WorkoutSession): SessionTotals {
  const done = session.sets.filter(isDone);
  return {
    completedSets: done.length,
    totalReps: done.reduce((sum, set) => sum + (set.actualReps ?? 0), 0),
    volume: done.reduce((sum, set) => sum + (set.actualWeight ?? 0) * (set.actualReps ?? 0), 0),
  };
}

/** Groups logs of the same exercise, even if it was later deleted from the template. */
export const exerciseKeyOf = (set: LoggedSet): string => set.dayExerciseId ?? `name:${set.exerciseName}`;

export interface ExerciseOption {
  key: string;
  name: string;
}

/** Exercises present in the history, named as in their latest session. */
export function exerciseOptions(sessions: WorkoutSession[]): ExerciseOption[] {
  const found = new Map<string, { name: string; order: number }>();
  sessions.forEach((session) =>
    session.sets.forEach((set) => {
      const key = exerciseKeyOf(set);
      if (!found.has(key)) found.set(key, { name: set.exerciseName, order: set.exerciseOrder });
    }),
  );
  return [...found.entries()]
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, { name }]) => ({ key, name }));
}

export interface BestSet {
  weight: number | null;
  reps: number;
}

/**
 * Real data only: more weight wins; with the same weight, more reps.
 * Sets without weight (bodyweight) count as 0, so they compare by reps.
 */
export function isBetterSet(candidate: BestSet, other: BestSet): boolean {
  const [a, b] = [candidate.weight ?? 0, other.weight ?? 0];
  return a > b || (a === b && candidate.reps > other.reps);
}

/** Best completed set (see `isBetterSet`). null if none qualifies. */
export function bestSet(sets: LoggedSet[]): BestSet | null {
  const done = sets.filter(isDone).map((set) => ({ weight: set.actualWeight, reps: set.actualReps ?? 0 }));
  if (done.length === 0) return null;
  return done.reduce((top, current) => (isBetterSet(current, top) ? current : top));
}

export interface ProgressPoint {
  sessionId: string;
  date: string;
  bestWeight: number | null;
  bestReps: number;
  totalReps: number;
  volume: number;
}

/** One point per session (oldest first) with the best set of that exercise. */
export function exerciseProgress(sessions: WorkoutSession[], key: string): ProgressPoint[] {
  return [...sessions].reverse().flatMap((session) => {
    const sets = session.sets.filter((set) => exerciseKeyOf(set) === key && isDone(set));
    const best = bestSet(sets);
    if (!best) return [];

    return [{
      sessionId: session.id,
      date: session.completedAt,
      bestWeight: best.weight,
      bestReps: best.reps,
      totalReps: sets.reduce((sum, set) => sum + (set.actualReps ?? 0), 0),
      volume: sets.reduce((sum, set) => sum + (set.actualWeight ?? 0) * (set.actualReps ?? 0), 0),
    }];
  });
}
