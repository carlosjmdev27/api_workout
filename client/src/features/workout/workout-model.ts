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
import type { RowEntry } from './active-workout';

/** One set row of the active workout (planned or extra). */
export interface WorkoutRow {
  key: string;
  exerciseId: string;
  setNumber: number;
  setType: SetType;
  targetRepMin: number;
  targetRepMax: number;
  targetWeight: number | null;
  /** Added on the fly: not part of the template. */
  isExtra: boolean;
  /** Same exercise + set number in the previous session ("ghost data"). */
  previous: LoggedSet | null;
  /** Pre-filled weight: last weight used, or the target. */
  defaultWeight: string;
}

export interface WorkoutGroup {
  exercise: DayExercise;
  rows: WorkoutRow[];
  canAddExtra: boolean;
}

export const rowKey = (exerciseId: string, setNumber: number): string => `${exerciseId}#${setNumber}`;

/** Decimal number as typed in Spanish ("85,5"). */
export const toInputText = (value: number | null): string =>
  value === null ? '' : String(value).replace('.', ',');

/** Template + extras + last session -> rows grouped by exercise. */
export function buildGroups(
  day: WorkoutDayDetail,
  last: WorkoutSession | undefined,
  extras: Record<string, number>,
): WorkoutGroup[] {
  const previousByKey = new Map(
    (last?.sets ?? []).flatMap((set) => (set.dayExerciseId ? [[rowKey(set.dayExerciseId, set.setNumber), set] as const] : [])),
  );

  return day.exercises.map((exercise) => {
    const lastPlanned = exercise.sets.at(-1);
    const extraCount = lastPlanned ? (extras[exercise.id] ?? 0) : 0;
    const templates = [
      ...exercise.sets.map((set) => ({ set, isExtra: false })),
      ...Array.from({ length: extraCount }, () => ({ set: lastPlanned ?? exercise.sets[0], isExtra: true })),
    ];

    const rows = templates.flatMap(({ set, isExtra }, index) => {
      if (!set) return [];
      const setNumber = index + 1;
      const key = rowKey(exercise.id, setNumber);
      const previous = previousByKey.get(key) ?? null;
      return [{
        key, exerciseId: exercise.id, setNumber, setType: set.setType, isExtra, previous,
        targetRepMin: set.targetRepMin, targetRepMax: set.targetRepMax, targetWeight: set.targetWeight,
        defaultWeight: toInputText(previous?.actualWeight ?? set.targetWeight),
      }];
    });
    return { exercise, rows, canAddExtra: rows.length < LIMITS.LOGGED_SET_NUMBER_MAX };
  });
}

/** Weight starts pre-filled; reps always start empty (they must be typed). */
export const entryFor = (row: WorkoutRow, entries: Record<string, RowEntry>): RowEntry =>
  entries[row.key] ?? { weight: row.defaultWeight, reps: '', completed: false };

/** Reps typed but the set not ticked: asked about when finishing. */
export const isPending = (entry: RowEntry): boolean => !entry.completed && entry.reps.trim() !== '';

/** A set can only be ticked with real reps (and a valid weight, if any). */
export function completionErrors(entry: RowEntry): FieldErrors | null {
  const errors: FieldErrors = {};
  const reps = parseDecimal(entry.reps);
  const weight = parseDecimal(entry.weight);
  if (reps === null) errors.actualReps = 'Escribe las reps hechas';
  else if (!Number.isInteger(reps) || reps < 0 || reps > LIMITS.REPS_MAX) errors.actualReps = 'Reps no válidas';
  if (weight !== null && (!Number.isFinite(weight) || weight < 0 || weight > LIMITS.WEIGHT_MAX)) {
    errors.actualWeight = 'Peso no válido';
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

export type PayloadResult =
  | { ok: true; data: SessionInput }
  | { ok: false; rowErrors: Record<string, FieldErrors>; message: string };

interface PayloadOptions {
  startedAt: string;
  notes: string;
  /** Also save sets with reps typed but not ticked. */
  includePending: boolean;
}

/** Completed sets (+ pending ones if confirmed), validated with the API schema. */
export function buildSessionPayload(
  dayId: string,
  rows: WorkoutRow[],
  entries: Record<string, RowEntry>,
  options: PayloadOptions,
): PayloadResult {
  const chosen = rows.filter((row) => {
    const entry = entryFor(row, entries);
    return entry.completed || (options.includePending && isPending(entry));
  });
  if (chosen.length === 0) {
    return { ok: false, rowErrors: {}, message: 'Marca al menos una serie como hecha antes de terminar.' };
  }

  const result = validateWith(sessionInputSchema, {
    workoutDayId: dayId,
    startedAt: options.startedAt,
    completedAt: new Date().toISOString(),
    notes: options.notes,
    sets: chosen.map((row) => {
      const entry = entryFor(row, entries);
      return {
        dayExerciseId: row.exerciseId,
        setNumber: row.setNumber,
        setType: row.setType,
        actualWeight: parseDecimal(entry.weight),
        actualReps: parseDecimal(entry.reps),
      };
    }),
  });
  if (result.ok) return { ok: true, data: result.data };

  const rowErrors: Record<string, FieldErrors> = {};
  Object.entries(result.errors).forEach(([path, message]) => {
    const [, index, field] = path.split('.');
    const row = chosen[Number(index)];
    if (row && field) rowErrors[row.key] = { ...rowErrors[row.key], [field]: message };
  });
  return { ok: false, rowErrors, message: 'Revisa los valores marcados en rojo.' };
}
