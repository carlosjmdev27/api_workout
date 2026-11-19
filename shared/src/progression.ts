/**
 * Estimated one-rep max using the Epley formula: weight × (1 + reps / 30).
 * Returns null when there is nothing to estimate (no weight or no reps).
 */
export function estimateOneRepMax(weight: number | null, reps: number | null): number | null {
  if (weight === null || reps === null || weight <= 0 || reps <= 0) return null;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}
