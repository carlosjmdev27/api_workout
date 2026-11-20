import type { z } from 'zod';

/** Error message per field path, e.g. "name" or "sets.0.targetRepMax". */
export type FieldErrors = Record<string, string>;

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

/** Parses user input ("60,5" or "60.5"). Returns null if empty, NaN if invalid. */
export function parseDecimal(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.');
  if (trimmed === '') return null;
  return Number(trimmed);
}

const CUSTOM_MESSAGES: Record<string, string> = {
  targetRepMax: 'Debe ser ≥ reps mín.',
  password: 'Demasiado larga: máximo 72 bytes (unos 36-72 caracteres)',
};

function isEmpty(input: unknown): boolean {
  return input === null || input === undefined || input === '';
}

function typeMessage(input: unknown): string {
  if (isEmpty(input)) return 'Campo obligatorio';
  if (typeof input === 'number' && Number.isFinite(input) && !Number.isInteger(input)) {
    return 'Debe ser un número entero';
  }
  return 'Debe ser un número';
}

/** Spanish, user-facing message for a Zod issue coming from the shared schemas. */
function messageFor(issue: z.core.$ZodIssue): string {
  switch (issue.code) {
    case 'invalid_type':
      return typeMessage(issue.input);
    case 'too_small':
      if (issue.origin === 'string') {
        return Number(issue.minimum) > 1 && !isEmpty(issue.input) ? `Mínimo ${String(issue.minimum)} caracteres` : 'Campo obligatorio';
      }
      if (issue.origin === 'array') return `Añade al menos ${String(issue.minimum)}`;
      return `Mínimo ${String(issue.minimum)}`;
    case 'too_big':
      if (issue.origin === 'string') return `Máximo ${String(issue.maximum)} caracteres`;
      return `Máximo ${String(issue.maximum)}`;
    case 'invalid_value':
      return 'Opción no válida';
    case 'invalid_format':
      return issue.format === 'email' ? 'Escribe un email válido' : 'Formato no válido';
    case 'custom':
      return CUSTOM_MESSAGES[String(issue.path.at(-1))] ?? 'Valor no válido';
    default:
      return 'Valor no válido';
  }
}

/**
 * Validates a form candidate with the SAME Zod schema the API uses
 * (from @gym/shared), returning the parsed data or per-field messages.
 */
export function validateWith<S extends z.ZodType>(
  schema: S,
  candidate: unknown,
): ValidationResult<z.output<S>> {
  const result = schema.safeParse(candidate, { reportInput: true });
  if (result.success) return { ok: true, data: result.data };

  const errors: FieldErrors = {};
  result.error.issues.forEach((issue) => {
    const key = issue.path.map(String).join('.');
    errors[key] ??= messageFor(issue);
  });
  return { ok: false, errors };
}
