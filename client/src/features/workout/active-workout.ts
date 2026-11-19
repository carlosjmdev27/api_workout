import { useSyncExternalStore } from 'react';
import { z } from 'zod';

/**
 * The single active workout, persisted in localStorage from the moment it starts
 * so a reload, a locked phone or navigating away never resets the timer or loses
 * the sets already logged. Only one workout can be active at a time.
 */
const STORAGE_KEY = 'active_workout_draft';
const CHANGE_EVENT = 'active-workout-change';
/** Older drafts are forgotten workouts (the API rejects sessions over 10 h anyway). */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

const entrySchema = z.object({ weight: z.string(), reps: z.string(), completed: z.boolean() });

const draftSchema = z.object({
  version: z.literal(2),
  dayId: z.string(),
  dayName: z.string(),
  routineId: z.string(),
  startedAt: z.string(), // ISO 8601
  notes: z.string(),
  entries: z.record(z.string(), entrySchema),
  /** Extra sets added on the fly, per exercise id. */
  extras: z.record(z.string(), z.number().int().min(0)),
});

export type ActiveWorkout = z.infer<typeof draftSchema>;
export type RowEntry = z.infer<typeof entrySchema>;

let cachedRaw: string | null = null;
let cachedDraft: ActiveWorkout | null = null;

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // Storage blocked (private mode…): the workout works without persistence.
  }
}

/** Current draft (memoised on the raw string so React sees a stable snapshot). */
export function loadActiveWorkout(): ActiveWorkout | null {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedDraft;
  cachedRaw = raw;
  cachedDraft = null;
  if (!raw) return null;
  try {
    const parsed = draftSchema.safeParse(JSON.parse(raw));
    if (parsed.success && Date.now() - Date.parse(parsed.data.startedAt) <= MAX_AGE_MS) {
      cachedDraft = parsed.data;
    }
  } catch {
    // Corrupted JSON: treated as no draft.
  }
  return cachedDraft;
}

function write(value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Quota exceeded or storage blocked: nothing else to do.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveActiveWorkout(draft: ActiveWorkout): void {
  write(JSON.stringify(draft));
}

export function clearActiveWorkout(): void {
  write(null);
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange); // Other tabs.
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** Reactive view of the active workout (used by the "workout in progress" banner). */
export function useActiveWorkout(): ActiveWorkout | null {
  return useSyncExternalStore(subscribe, loadActiveWorkout, () => null);
}

export const activeWorkoutPath = (dayId: string): string => `/workout/active/${dayId}`;
