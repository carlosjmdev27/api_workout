const numberFormat = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });

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
