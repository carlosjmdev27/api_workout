import { z } from 'zod';
import { LIMITS } from '../limits.js';
import { WEIGHT_UNITS } from '../weight-units.js';
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

/** 3-20 letters, digits or "_", no spaces. Stored and compared in lowercase. */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    new RegExp(`^[a-z0-9_]{${LIMITS.USERNAME_MIN},${LIMITS.USERNAME_MAX}}$`),
    `Must be ${LIMITS.USERNAME_MIN}-${LIMITS.USERNAME_MAX} letters, digits or "_"`,
  );

export const registerInputSchema = z.strictObject({
  name: requiredText(LIMITS.NAME_MAX),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

/** Email OR username in the same field (an email always has "@", a username never). */
export const identifierSchema = z.string().trim().toLowerCase().min(1, 'Must not be empty').max(LIMITS.EMAIL_MAX);

/** Login only checks shape: password rules are not revealed or enforced here. */
export const loginInputSchema = z.strictObject({
  identifier: identifierSchema,
  password: z.string().min(1, 'Must not be empty').max(1024),
});

/** Asks for a new confirmation email (same identifier as the login). */
export const resendVerificationSchema = z.strictObject({
  identifier: identifierSchema,
});

/** Body weight: a reasonable positive number, or null to clear it. */
export const bodyWeightSchema = z
  .number('Must be a number')
  .min(LIMITS.BODY_WEIGHT_MIN, `Must be between ${LIMITS.BODY_WEIGHT_MIN} and ${LIMITS.BODY_WEIGHT_MAX}`)
  .max(LIMITS.BODY_WEIGHT_MAX, `Must be between ${LIMITS.BODY_WEIGHT_MIN} and ${LIMITS.BODY_WEIGHT_MAX}`)
  .nullable();

/** Profile edit: every field is sent (the form always has them). */
export const profileUpdateSchema = z.strictObject({
  name: requiredText(LIMITS.NAME_MAX),
  username: usernameSchema,
  email: emailSchema,
  bodyWeight: bodyWeightSchema,
  weightUnit: z.enum(WEIGHT_UNITS, "Must be 'kg' or 'lb'"),
});

/** The current password is only compared, so it gets the loose login rules. */
export const passwordChangeSchema = z.strictObject({
  currentPassword: z.string().min(1, 'Must not be empty').max(1024),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
