const numberFormat = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });
const dateTimeFormat = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
const shortDateFormat = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return shortDateFormat.format(new Date(iso));
}

/** Seconds -> "1 h 05 min" / "40 min" / "45 s". */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours === 0 ? `${rest} min` : `${hours} h ${String(rest).padStart(2, '0')} min`;
}

/** "+320 kg" / "−2" / "=" — signed difference (text, never colour alone). */
export function signedDelta(value: number, unit = ''): string {
  if (value === 0) return '=';
  const rounded = Math.round(Math.abs(value) * 10) / 10;
  return `${value > 0 ? '+' : '−'}${formatNumber(rounded)}${unit ? ` ${unit}` : ''}`;
}

/** Milliseconds -> "HH:MM:SS" (stopwatch). */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

export function formatWeight(kg: number): string {
  return `${numberFormat.format(kg)} kg`;
}

/** 8,8 -> "8"; 6,8 -> "6-8". */
export function formatRepRange(min: number, max: number): string {
  return min === max ? String(min) : `${min}-${max}`;
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
