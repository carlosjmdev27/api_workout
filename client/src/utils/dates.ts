const pad = (n: number): string => String(n).padStart(2, '0');

/** Local calendar date as "YYYY-MM-DD" (what <input type="date"> uses). */
export function toLocalDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today in the user's time zone. */
export function todayInput(): string {
  return toLocalDateInput(new Date());
}

/**
 * Exact age in whole years for a "YYYY-MM-DD" birth date (null if missing, invalid or future).
 * Pure calendar arithmetic: no time zones involved.
 */
export function ageFrom(birthDate: string, today: string = todayInput()): number | null {
  const birth = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  const now = /^(\d{4})-(\d{2})-(\d{2})$/.exec(today);
  if (!birth || !now || birthDate > today) return null;
  const [by, bm, bd] = birth.slice(1).map(Number) as [number, number, number];
  const [ty, tm, td] = now.slice(1).map(Number) as [number, number, number];
  const hadBirthday = tm > bm || (tm === bm && td >= bd);
  return ty - by - (hadBirthday ? 0 : 1);
}

/**
 * ISO datetime for a weigh-in picked as a local date: today -> now (keeps today's order),
 * another day -> that day at 12:00 local (stays on the same date in every time zone view).
 */
export function weighInTimestamp(dateInput: string, now: Date = new Date()): string {
  if (dateInput === toLocalDateInput(now)) return now.toISOString();
  const [y, m, d] = dateInput.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d, 12, 0, 0).toISOString();
}
