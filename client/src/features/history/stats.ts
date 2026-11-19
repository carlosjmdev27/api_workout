import { estimateOneRepMax, type LoggedSet, type WorkoutSession } from '@gym/shared';

/** A set counts for stats when it was completed and has reps. */
const isDone = (set: LoggedSet): boolean => set.completed && set.actualReps !== null;

export interface SessionTotals {
  completedSets: number;
  totalReps: number;
  /** Weight moved: Σ weight × reps of completed sets (kg). */
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

export interface ProgressPoint {
  sessionId: string;
  date: string;
  bestWeight: number | null;
  bestReps: number;
  e1rm: number | null;
  totalReps: number;
  volume: number;
}

/** One point per session (oldest first) with the best set of that exercise. */
export function exerciseProgress(sessions: WorkoutSession[], key: string): ProgressPoint[] {
  return [...sessions].reverse().flatMap((session) => {
    const sets = session.sets.filter((set) => exerciseKeyOf(set) === key && isDone(set));
    if (sets.length === 0) return [];

    const scored = sets.map((set) => ({ set, e1rm: estimateOneRepMax(set.actualWeight, set.actualReps) }));
    const best = scored.reduce((top, current) =>
      (current.e1rm ?? -1) > (top.e1rm ?? -1) ||
      ((current.e1rm ?? -1) === (top.e1rm ?? -1) && (current.set.actualWeight ?? 0) > (top.set.actualWeight ?? 0))
        ? current
        : top,
    );
    return [{
      sessionId: session.id,
      date: session.completedAt,
      bestWeight: best.set.actualWeight,
      bestReps: best.set.actualReps ?? 0,
      e1rm: best.e1rm,
      totalReps: sets.reduce((sum, set) => sum + (set.actualReps ?? 0), 0),
      volume: sets.reduce((sum, set) => sum + (set.actualWeight ?? 0) * (set.actualReps ?? 0), 0),
    }];
  });
}
