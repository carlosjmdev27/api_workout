import { z } from 'zod';
import { COUNTRY_CODES } from '../countries.js';
import { LIMITS } from '../limits.js';
import { WEIGHT_UNITS } from '../weight-units.js';
import { optionalText, requiredText } from './common.schema.js';

/** Today as YYYY-MM-DD in the most advanced time zone (UTC+14): a local "today" is never rejected. */
function latestToday(): string {
  return new Date(Date.now() + 14 * 3600 * 1000).toISOString().slice(0, 10);
}

/** A real calendar date "YYYY-MM-DD" (rejects 2026-02-30). */
function isRealDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Birth date: real, not in the future, not before 1900. */
export const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a date (YYYY-MM-DD)')
  .refine(isRealDate, 'Must be a real date')
  .refine((value) => value >= LIMITS.BIRTH_DATE_MIN, 'Must be after 1900')
  .refine((value) => value <= latestToday(), 'Must not be in the future');

/** Perfil: personal data. Every field is sent; optional ones are null when empty. */
export const personalProfileSchema = z.strictObject({
  name: requiredText(LIMITS.NAME_MAX),
  lastName: optionalText(LIMITS.NAME_MAX).transform((value) => value ?? null),
  country: z.enum(COUNTRY_CODES, 'Must be an ISO 3166-1 country code').nullable(),
  birthDate: birthDateSchema.nullable(),
});

/** Mi progreso: height and preferred weight unit (relabels weights, never converts them). */
export const physicalProfileSchema = z.strictObject({
  heightCm: z
    .number('Must be a number')
    .min(LIMITS.HEIGHT_MIN_CM, `Must be between ${LIMITS.HEIGHT_MIN_CM} and ${LIMITS.HEIGHT_MAX_CM}`)
    .max(LIMITS.HEIGHT_MAX_CM, `Must be between ${LIMITS.HEIGHT_MIN_CM} and ${LIMITS.HEIGHT_MAX_CM}`)
    .nullable(),
  weightUnit: z.enum(WEIGHT_UNITS, "Must be 'kg' or 'lb'"),
});

/** A body weight measure (20-500, in `unit`). */
export const bodyWeightSchema = z
  .number('Must be a number')
  .min(LIMITS.BODY_WEIGHT_MIN, `Must be between ${LIMITS.BODY_WEIGHT_MIN} and ${LIMITS.BODY_WEIGHT_MAX}`)
  .max(LIMITS.BODY_WEIGHT_MAX, `Must be between ${LIMITS.BODY_WEIGHT_MIN} and ${LIMITS.BODY_WEIGHT_MAX}`);

/** 5 min of clock skew between the phone and the server is tolerated. */
const CLOCK_SKEW_MS = 5 * 60 * 1000;

/** New weigh-in. `recordedAt` (ISO datetime) defaults to now; never in the future. */
export const weightLogInputSchema = z.strictObject({
  weight: bodyWeightSchema,
  unit: z.enum(WEIGHT_UNITS, "Must be 'kg' or 'lb'"),
  recordedAt: z.iso
    .datetime({ offset: true })
    .refine((value) => Date.parse(value) <= Date.now() + CLOCK_SKEW_MS, 'Must not be in the future')
    .refine((value) => value >= '1970', 'Must be a real date')
    .optional(),
});

export type PersonalProfileUpdate = z.infer<typeof personalProfileSchema>;
export type PhysicalProfileUpdate = z.infer<typeof physicalProfileSchema>;
export type WeightLogInput = z.infer<typeof weightLogInputSchema>;
