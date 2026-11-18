const numberFormat = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });

/** 90 -> "1:30 min", 60 -> "1 min", 45 -> "45 s". */
export function formatRest(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} s`;
  if (rest === 0) return `${minutes} min`;
  return `${minutes}:${String(rest).padStart(2, '0')} min`;
}

export function formatWeight(kg: number): string {
  return `${numberFormat.format(kg)} kg`;
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
