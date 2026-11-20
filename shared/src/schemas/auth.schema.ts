import { z } from 'zod';
import { LIMITS } from '../limits.js';
import { requiredText } from './common.schema.js';

/** Emails are compared and stored trimmed and in lowercase. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(LIMITS.EMAIL_MAX)
  .pipe(z.email('Must be a valid email'));

const byteLength = (value: string): number => new TextEncoder().encode(value).length;

/** Never trimmed: spaces are valid password characters. */
export const passwordSchema = z
  .string()
  .min(LIMITS.PASSWORD_MIN, `Must have at least ${LIMITS.PASSWORD_MIN} characters`)
  .refine((value) => byteLength(value) <= LIMITS.PASSWORD_MAX_BYTES, {
    message: `Must not exceed ${LIMITS.PASSWORD_MAX_BYTES} bytes`,
  });

export const registerInputSchema = z.strictObject({
  name: requiredText(LIMITS.NAME_MAX),
  email: emailSchema,
  password: passwordSchema,
});

/** Login only checks shape: password rules are not revealed or enforced here. */
export const loginInputSchema = z.strictObject({
  email: emailSchema,
  password: z.string().min(1, 'Must not be empty').max(1024),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
