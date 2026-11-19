import type { WorkoutSession } from '@gym/shared';
import { bestSet, exerciseKeyOf, sessionTotals, type BestSet, type SessionTotals } from './stats';

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
  /** e1RM difference vs the previous session (kg), when both exist. */
  delta: number | null;
  /** Best e1RM ever for this exercise (needs at least one earlier session with data). */
  isRecord: boolean;
}

/** Per-exercise progress of `session` vs the previous one and vs all earlier sessions. */
export function compareExercises(session: WorkoutSession, history: WorkoutSession[]): ExerciseComparison[] {
  const time = Date.parse(session.completedAt);
  const earlier = history.filter((other) => other.id !== session.id && Date.parse(other.completedAt) < time);
  const previous = earlier[0];
  const keys = [...new Map(session.sets.map((set) => [exerciseKeyOf(set), set.exerciseName])).entries()];

  return keys.map(([key, name]) => {
    const setsOf = (s: WorkoutSession) => s.sets.filter((set) => exerciseKeyOf(set) === key);
    const best = bestSet(setsOf(session));
    const previousBest = previous ? bestSet(setsOf(previous)) : null;
    const earlierBestE1rm = Math.max(-1, ...earlier.map((s) => bestSet(setsOf(s))?.e1rm ?? -1));
    const delta = best?.e1rm != null && previousBest?.e1rm != null
      ? Math.round((best.e1rm - previousBest.e1rm) * 10) / 10
      : null;

    return {
      key,
      name,
      best,
      previousBest,
      delta,
      isRecord: best?.e1rm != null && earlierBestE1rm >= 0 && best.e1rm > earlierBestE1rm,
    };
  });
}
