import type { LoggedSet, WorkoutSession } from '@gym/shared';
import { bestSet, exerciseKeyOf, isBetterSet, sessionTotals, type BestSet, type SessionTotals } from './stats';

/** The session of the same day completed right before `session` (history is newest first). */
export function previousSessionOf(session: WorkoutSession, history: WorkoutSession[]): WorkoutSession | undefined {
  const time = Date.parse(session.completedAt);
  return history.find((other) => other.id !== session.id && Date.parse(other.completedAt) < time);
}

export interface TotalsComparison {
  current: SessionTotals;
  previous: SessionTotals | null;
}

export function compareTotals(session: WorkoutSession, previous: WorkoutSession | undefined): TotalsComparison {
  return { current: sessionTotals(session), previous: previous ? sessionTotals(previous) : null };
}

export interface ExerciseComparison {
  key: string;
  name: string;
  best: BestSet | null;
  previousBest: BestSet | null;
  /** Heaviest weight today minus the previous session's (kg), when both have weight. */
  weightDelta: number | null;
  /** Completed reps of this exercise today. */
  totalReps: number;
  /** Reps today minus the previous session's, when it also had this exercise. */
  repsDelta: number | null;
  /** Today's best set beats every earlier session (more weight, or same weight and more reps). */
  isRecord: boolean;
}

const repsOf = (sets: LoggedSet[]): number =>
  sets.reduce((sum, set) => sum + (set.completed ? (set.actualReps ?? 0) : 0), 0);

/** Per-exercise progress of `session` vs the previous one and vs all earlier sessions. */
export function compareExercises(session: WorkoutSession, history: WorkoutSession[]): ExerciseComparison[] {
  const time = Date.parse(session.completedAt);
  const earlier = history.filter((other) => other.id !== session.id && Date.parse(other.completedAt) < time);
  const previous = earlier[0];
  const keys = [...new Map(session.sets.map((set) => [exerciseKeyOf(set), set.exerciseName])).entries()];

  return keys.map(([key, name]) => {
    const setsOf = (s: WorkoutSession): LoggedSet[] => s.sets.filter((set) => exerciseKeyOf(set) === key);
    const best = bestSet(setsOf(session));
    const previousSets = previous ? setsOf(previous) : [];
    const previousBest = bestSet(previousSets);
    const earlierBests = earlier.flatMap((s) => bestSet(setsOf(s)) ?? []);
    const totalReps = repsOf(setsOf(session));

    return {
      key,
      name,
      best,
      previousBest,
      weightDelta: best?.weight != null && previousBest?.weight != null
        ? Math.round((best.weight - previousBest.weight) * 10) / 10
        : null,
      totalReps,
      repsDelta: previousSets.length > 0 ? totalReps - repsOf(previousSets) : null,
      isRecord: best !== null && earlierBests.length > 0 && earlierBests.every((other) => isBetterSet(best, other)),
    };
  });
}
