/**
 * Units a user can choose for every weight in the app. Weights are stored exactly as
 * typed, in the unit active at the time: changing the unit never converts old records.
 */
export const WEIGHT_UNITS = ['kg', 'lb'] as const;

export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const DEFAULT_WEIGHT_UNIT: WeightUnit = 'kg';

export function isWeightUnit(value: string): value is WeightUnit {
  return (WEIGHT_UNITS as readonly string[]).includes(value);
}
