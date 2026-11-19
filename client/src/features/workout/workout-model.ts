import {
  LIMITS,
  sessionInputSchema,
  type DayExercise,
  type LoggedSet,
  type SessionInput,
  type SetType,
  type WorkoutDayDetail,
  type WorkoutSession,
} from '@gym/shared';
import { parseDecimal, validateWith, type FieldErrors } from '../../utils/validation';

/** One planned set as shown in the workout screen. */
export interface WorkoutRow {
  key: string;
  exerciseId: string;
  setNumber: number;
  setType: SetType;
  targetRepMin: number;
  targetRepMax: number;
  targetWeight: number | null;
  /** Same exercise + set number in the previous session ("ghost data"). */
  previous: LoggedSet | null;
  /** Used to auto-fill empty inputs when the set is ticked. */
  suggestedWeight: number | null;
  suggestedReps: number;
}

export interface WorkoutGroup {
  exercise: DayExercise;
  rows: WorkoutRow[];
}

/** What the user typed for a row. */
export interface RowEntry {
  weight: string;
  reps: string;
  completed: boolean;
}

export const EMPTY_ENTRY: RowEntry = { weight: '', reps: '', completed: false };

export const rowKey = (exerciseId: string, setNumber: number): string => `${exerciseId}#${setNumber}`;

/** Decimal number as the user would type it in Spanish ("85,5"). */
export const toInputText = (value: number | null): string =>
  value === null ? '' : String(value).replace('.', ',');

/** Template + last session -> rows grouped by exercise, with ghost data and suggestions. */
export function buildGroups(day: WorkoutDayDetail, last: WorkoutSession | undefined): WorkoutGroup[] {
  const previousByKey = new Map(
    (last?.sets ?? [])
      .filter((set) => set.dayExerciseId !== null)
      .map((set) => [rowKey(set.dayExerciseId ?? '', set.setNumber), set]),
  );

  return day.exercises.map((exercise) => ({
    exercise,
    rows: exercise.sets.map((set) => {
      const key = rowKey(exercise.id, set.setNumber);
      const previous = previousByKey.get(key) ?? null;
      return {
        key,
        exerciseId: exercise.id,
        setNumber: set.setNumber,
        setType: set.setType,
        targetRepMin: set.targetRepMin,
        targetRepMax: set.targetRepMax,
        targetWeight: set.targetWeight,
        previous,
        suggestedWeight: previous?.actualWeight ?? set.targetWeight,
        suggestedReps: previous?.actualReps ?? set.targetRepMin,
      };
    }),
  }));
}

/** Ticking a set fills its empty inputs with the suggestion (autocomplete). */
export function completeEntry(entry: RowEntry, row: WorkoutRow): RowEntry {
  return {
    completed: true,
    weight: entry.weight.trim() === '' ? toInputText(row.suggestedWeight) : entry.weight,
    reps: entry.reps.trim() === '' ? String(row.suggestedReps) : entry.reps,
  };
}

export const hasData = (entry: RowEntry): boolean =>
  entry.completed || entry.weight.trim() !== '' || entry.reps.trim() !== '';

export function elapsedMinutes(startedAt: number, now: number): number {
  const minutes = Math.round((now - startedAt) / 60000);
  return Math.min(Math.max(minutes, 1), LIMITS.SESSION_DURATION_MAX_MINUTES);
}

export type PayloadResult =
  | { ok: true; data: SessionInput }
  | { ok: false; rowErrors: Record<string, FieldErrors>; message: string };

/**
 * Builds the session from the rows that have data and validates it with the
 * API schema. Errors are mapped back from "sets.i.actualReps" to each row.
 */
export function buildSessionPayload(
  dayId: string,
  rows: WorkoutRow[],
  entries: Record<string, RowEntry>,
  meta: { startedAt: number; notes: string },
): PayloadResult {
  const included = rows.filter((row) => hasData(entries[row.key] ?? EMPTY_ENTRY));
  if (included.length === 0) {
    return { ok: false, rowErrors: {}, message: 'Marca o rellena al menos una serie antes de guardar.' };
  }

  const result = validateWith(sessionInputSchema, {
    workoutDayId: dayId,
    durationMinutes: elapsedMinutes(meta.startedAt, Date.now()),
    notes: meta.notes,
    sets: included.map((row) => {
      const entry = entries[row.key] ?? EMPTY_ENTRY;
      return {
        dayExerciseId: row.exerciseId,
        setNumber: row.setNumber,
        setType: row.setType,
        actualWeight: parseDecimal(entry.weight),
        actualReps: parseDecimal(entry.reps),
        completed: entry.completed,
      };
    }),
  });
  if (result.ok) return { ok: true, data: result.data };

  const rowErrors: Record<string, FieldErrors> = {};
  Object.entries(result.errors).forEach(([path, message]) => {
    const [, index, field] = path.split('.');
    const row = included[Number(index)];
    if (row && field) rowErrors[row.key] = { ...rowErrors[row.key], [field]: message };
  });
  return { ok: false, rowErrors, message: 'Revisa los valores marcados en rojo.' };
}
