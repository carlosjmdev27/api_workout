import { useEffect, useMemo, useState } from 'react';
import type { SessionInput, WorkoutDayDetail, WorkoutSession } from '@gym/shared';
import type { FieldErrors } from '../../utils/validation';
import {
  clearActiveWorkout,
  loadActiveWorkout,
  saveActiveWorkout,
  type ActiveWorkout,
  type RowEntry,
} from './active-workout';
import { buildGroups, buildSessionPayload, completionErrors, entryFor, isPending, rowKey } from './workout-model';

function freshWorkout(day: WorkoutDayDetail): ActiveWorkout {
  return {
    version: 2,
    dayId: day.id,
    dayName: day.name,
    routineId: day.routineId,
    startedAt: new Date().toISOString(),
    notes: '',
    entries: {},
    extras: {},
  };
}

/** State of the active workout. Persisted from the very first render (timer never resets). */
export function useWorkoutSession(day: WorkoutDayDetail, lastSession: WorkoutSession | undefined) {
  const [resumed] = useState(() => loadActiveWorkout()?.dayId === day.id);
  const [state, setState] = useState<ActiveWorkout>(() => {
    const existing = loadActiveWorkout();
    return existing?.dayId === day.id ? existing : freshWorkout(day);
  });
  const [rowErrors, setRowErrors] = useState<Record<string, FieldErrors>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => saveActiveWorkout(state), [state]);

  const groups = useMemo(() => buildGroups(day, lastSession, state.extras), [day, lastSession, state.extras]);
  const rows = useMemo(() => groups.flatMap((group) => group.rows), [groups]);
  const rowByKey = useMemo(() => new Map(rows.map((row) => [row.key, row])), [rows]);

  const entryOf = (key: string): RowEntry => {
    const row = rowByKey.get(key);
    return row ? entryFor(row, state.entries) : { weight: '', reps: '', completed: false };
  };

  const setEntry = (key: string, entry: RowEntry): void => {
    setState((previous) => ({ ...previous, entries: { ...previous.entries, [key]: entry } }));
  };

  const setRowError = (key: string, errors: FieldErrors | null): void => {
    setRowErrors((previous) => {
      const next = { ...previous };
      if (errors) next[key] = errors;
      else delete next[key];
      return next;
    });
  };

  const setValue = (key: string, field: 'weight' | 'reps', value: string): void => {
    setEntry(key, { ...entryOf(key), [field]: value });
    setRowError(key, null);
  };

  /** Returns false when the set cannot be ticked yet (reps missing/invalid). */
  const toggle = (key: string): boolean => {
    const entry = entryOf(key);
    if (entry.completed) {
      setEntry(key, { ...entry, completed: false });
      return true;
    }
    const errors = completionErrors(entry);
    setRowError(key, errors);
    if (!errors) setEntry(key, { ...entry, completed: true });
    return errors === null;
  };

  const changeExtras = (exerciseId: string, delta: 1 | -1): void => {
    setState((previous) => {
      const count = Math.max(0, (previous.extras[exerciseId] ?? 0) + delta);
      const entries = { ...previous.entries };
      if (delta === -1) {
        const planned = day.exercises.find((e) => e.id === exerciseId)?.sets.length ?? 0;
        delete entries[rowKey(exerciseId, planned + count + 1)];
      }
      return { ...previous, entries, extras: { ...previous.extras, [exerciseId]: count } };
    });
  };

  const buildPayload = (includePending: boolean): SessionInput | null => {
    const result = buildSessionPayload(day.id, rows, state.entries, { ...state, includePending });
    setRowErrors(result.ok ? {} : result.rowErrors);
    setFormError(result.ok ? null : result.message);
    return result.ok ? result.data : null;
  };

  const entries = rows.map((row) => entryOf(row.key));
  return {
    groups,
    startedAt: state.startedAt,
    notes: state.notes,
    resumed,
    rowErrors,
    formError,
    completedCount: entries.filter((entry) => entry.completed).length,
    pendingCount: entries.filter(isPending).length,
    totalCount: rows.length,
    entryOf,
    setValue,
    toggle,
    addExtra: (exerciseId: string) => changeExtras(exerciseId, 1),
    removeExtra: (exerciseId: string) => changeExtras(exerciseId, -1),
    setNotes: (notes: string) => setState((previous) => ({ ...previous, notes })),
    buildPayload,
    discard: clearActiveWorkout,
  };
}

export type WorkoutSessionState = ReturnType<typeof useWorkoutSession>;
