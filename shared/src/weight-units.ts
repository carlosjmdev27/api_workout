/**
 * Units a user can choose for every weight in the app. Weights are stored exactly as
 * typed, in the unit active at the time: changing the unit never converts old records.
 */
export const WEIGHT_UNITS = ['kg', 'lb'] as const;

export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const DEFAULT_WEIGHT_UNIT: WeightUnit = 'kg';

const KG_PER_LB = 0.45359237;

/**
 * For DISPLAY only (e.g. a body weight chart that mixes kg and lb entries): stored values
 * are never rewritten. Rounded to 1 decimal.
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  const converted = from === 'kg' ? value / KG_PER_LB : value * KG_PER_LB;
  return Math.round(converted * 10) / 10;
}

export function isWeightUnit(value: string): value is WeightUnit {
  return (WEIGHT_UNITS as readonly string[]).includes(value);
}
