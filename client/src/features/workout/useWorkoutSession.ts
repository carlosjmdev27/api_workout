import { useEffect, useMemo, useState } from 'react';
import type { SessionInput, WorkoutDayDetail, WorkoutSession } from '@gym/shared';
import type { FieldErrors } from '../../utils/validation';
import { clearDraft, loadDraft, saveDraft, type DraftEntries } from './workout-draft';
import {
  EMPTY_ENTRY,
  buildGroups,
  buildSessionPayload,
  completeEntry,
  hasData,
  type RowEntry,
} from './workout-model';

interface SessionState {
  startedAt: number;
  notes: string;
  entries: DraftEntries;
}

const freshState = (): SessionState => ({ startedAt: Date.now(), notes: '', entries: {} });

/** State of an active workout: entries per set, ghost data, draft and payload. */
export function useWorkoutSession(day: WorkoutDayDetail, lastSession: WorkoutSession | undefined) {
  const groups = useMemo(() => buildGroups(day, lastSession), [day, lastSession]);
  const rows = useMemo(() => groups.flatMap((group) => group.rows), [groups]);
  const [restored] = useState(() => loadDraft(day.id));
  const [state, setState] = useState<SessionState>(() => restored ?? freshState());
  const [rowErrors, setRowErrors] = useState<Record<string, FieldErrors>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const entryOf = (key: string): RowEntry => state.entries[key] ?? EMPTY_ENTRY;
  const hasProgress = state.notes.trim() !== '' || Object.values(state.entries).some(hasData);

  // Persist only once there is something worth recovering.
  useEffect(() => {
    if (hasProgress) saveDraft(day.id, state);
  }, [day.id, state, hasProgress]);

  const updateEntry = (key: string, next: RowEntry): void => {
    setState((previous) => ({ ...previous, entries: { ...previous.entries, [key]: next } }));
    setRowErrors((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const setValue = (key: string, field: 'weight' | 'reps', value: string): void => {
    updateEntry(key, { ...entryOf(key), [field]: value });
  };

  const toggle = (key: string): void => {
    const row = rows.find((candidate) => candidate.key === key);
    const entry = entryOf(key);
    if (!row) return;
    updateEntry(key, entry.completed ? { ...entry, completed: false } : completeEntry(entry, row));
  };

  const setNotes = (notes: string): void => setState((previous) => ({ ...previous, notes }));

  const discard = (): void => {
    clearDraft(day.id);
    setState(freshState());
    setRowErrors({});
    setFormError(null);
  };

  /** Validates; returns the payload or shows the errors. */
  const buildPayload = (): SessionInput | null => {
    const result = buildSessionPayload(day.id, rows, state.entries, state);
    setRowErrors(result.ok ? {} : result.rowErrors);
    setFormError(result.ok ? null : result.message);
    return result.ok ? result.data : null;
  };

  const completedCount = rows.filter((row) => entryOf(row.key).completed).length;

  return {
    groups,
    startedAt: state.startedAt,
    notes: state.notes,
    wasRestored: restored !== null,
    hasProgress,
    completedCount,
    totalCount: rows.length,
    rowErrors,
    formError,
    entryOf,
    setValue,
    toggle,
    setNotes,
    discard,
    buildPayload,
    clearDraft: () => clearDraft(day.id),
  };
}

export type WorkoutSessionState = ReturnType<typeof useWorkoutSession>;
