import type { FormErrors } from '../types/form';

interface TextRule {
  max: number;
  required?: boolean;
}

interface NumberRule {
  min: number;
  max: number;
  integer?: boolean;
  required?: boolean;
}

/** Parses user input ("60,5" or "60.5"). Returns null if empty, NaN if invalid. */
export function parseDecimal(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.');
  if (trimmed === '') return null;
  return Number(trimmed);
}

export function checkText(raw: string, rule: TextRule): string | undefined {
  const value = raw.trim();
  if (value === '') return rule.required ? 'Campo obligatorio' : undefined;
  if (value.length > rule.max) return `Máximo ${rule.max} caracteres`;
  return undefined;
}

export function checkNumber(raw: string, rule: NumberRule): string | undefined {
  const value = parseDecimal(raw);
  if (value === null) return rule.required ? 'Campo obligatorio' : undefined;
  if (!Number.isFinite(value)) return 'Debe ser un número';
  if (rule.integer && !Number.isInteger(value)) return 'Debe ser un número entero';
  if (value < rule.min || value > rule.max) return `Debe estar entre ${rule.min} y ${rule.max}`;
  return undefined;
}

/** Removes fields without error so `{}` means "valid". */
export function compactErrors<T>(errors: FormErrors<T>): FormErrors<T> {
  const entries = Object.entries(errors).filter(([, message]) => message !== undefined);
  return Object.fromEntries(entries) as FormErrors<T>;
}

export function hasErrors<T>(errors: FormErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

/** Empty text becomes null, so optional fields can be cleared. */
export function toOptionalText(raw: string): string | null {
  const value = raw.trim();
  return value === '' ? null : value;
}
