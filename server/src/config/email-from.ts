export interface EmailSenderIdentity {
  name: string;
  email: string;
}

const DEFAULT_SENDER_NAME = 'AuraWorkout';
/** Deliberately simple: one "@", no spaces or angle brackets. Brevo validates the rest. */
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/**
 * Parses EMAIL_FROM: `"Nombre <correo@dominio.com>"` or just `"correo@dominio.com"`
 * (then the name is "AuraWorkout"). Quotes around the name are dropped.
 * Returns null when there is no valid email in it.
 */
export function parseEmailFrom(value: string): EmailSenderIdentity | null {
  const trimmed = value.trim();
  const withName = /^(.*?)\s*<([^<>]+)>$/.exec(trimmed);
  const email = (withName ? withName[2] : trimmed)?.trim() ?? '';
  if (!EMAIL.test(email)) return null;
  const name = withName?.[1]?.trim().replace(/^"(.*)"$/, '$1').trim() || DEFAULT_SENDER_NAME;
  return { name, email };
}
