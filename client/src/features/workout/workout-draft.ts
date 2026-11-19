import { z } from 'zod';
import type { RowEntry } from './workout-model';

/**
 * Unsaved workout kept in localStorage, so a phone lock, reload or accidental
 * navigation in the gym never loses the sets already logged.
 */
const draftSchema = z.object({
  version: z.literal(1),
  startedAt: z.number(),
  notes: z.string(),
  entries: z.record(
    z.string(),
    z.object({ weight: z.string(), reps: z.string(), completed: z.boolean() }),
  ),
});

export type WorkoutDraft = z.infer<typeof draftSchema>;

const storageKey = (dayId: string): string => `gym-routines:workout-draft:${dayId}`;

/** Drafts older than this are ignored (a forgotten session from days ago). */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export function loadDraft(dayId: string): WorkoutDraft | null {
  try {
    const raw = localStorage.getItem(storageKey(dayId));
    if (!raw) return null;
    const parsed = draftSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || Date.now() - parsed.data.startedAt > MAX_AGE_MS) return null;
    return parsed.data;
  } catch {
    return null; // Storage unavailable or corrupted JSON: start fresh.
  }
}

export function saveDraft(dayId: string, draft: Omit<WorkoutDraft, 'version'>): void {
  try {
    localStorage.setItem(storageKey(dayId), JSON.stringify({ version: 1, ...draft }));
  } catch {
    // Quota exceeded or storage blocked: the workout still works, just without a draft.
  }
}

export function clearDraft(dayId: string): void {
  try {
    localStorage.removeItem(storageKey(dayId));
  } catch {
    // Nothing to do.
  }
}

export type DraftEntries = Record<string, RowEntry>;
