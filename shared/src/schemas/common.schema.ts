import { z } from 'zod';

/** Required trimmed text. */
export function requiredText(max: number) {
  return z.string().trim().min(1, 'Must not be empty').max(max);
}

/** Optional trimmed text; "" is stored as null so a field can be cleared. */
export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value))
    .nullish();
}

export const uuidSchema = z.uuid('Must be a valid UUID');

/** Non-empty list of unique ids (used to reorder items). */
export function idListSchema(max: number) {
  return z
    .array(uuidSchema)
    .min(1)
    .max(max)
    .refine((ids) => new Set(ids).size === ids.length, { message: 'Ids must be unique' });
}

/** For partial updates: at least one field must be present. */
export function hasAnyField(data: object): boolean {
  return Object.keys(data).length > 0;
}

export const AT_LEAST_ONE_FIELD = { message: 'At least one field must be provided' };
