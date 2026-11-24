import type { SetType } from '@gym/shared';

export const SET_TYPE_LABELS: Record<SetType, string> = {
  warmup: 'Aproximación',
  normal: 'Normal',
  topset: 'Top set',
  backoff: 'Back-off',
  restpause: 'Rest-pause',
  dropset: 'Drop set',
};

/** Short labels for dense rows (the full label goes in the tooltip). */
export const SET_TYPE_SHORT: Record<SetType, string> = {
  warmup: 'WARM',
  normal: 'NORM',
  topset: 'TOP',
  backoff: 'BACK',
  restpause: 'RP',
  dropset: 'DROP',
};

/** Subtle colour per set type (full class strings so Tailwind can detect them). */
export const SET_TYPE_STYLES: Record<SetType, string> = {
  // Translucent tint works on both themes; text is dark (700) on light, light (300) on dark.
  warmup: 'bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300',
  normal: 'bg-zinc-500/15 text-zinc-700 ring-zinc-500/30 dark:text-zinc-300',
  topset: 'bg-rose-500/15 text-rose-700 ring-rose-500/30 dark:text-rose-300',
  backoff: 'bg-amber-500/15 text-amber-800 ring-amber-500/30 dark:text-amber-300',
  restpause: 'bg-violet-500/15 text-violet-700 ring-violet-500/30 dark:text-violet-300',
  dropset: 'bg-teal-500/15 text-teal-700 ring-teal-500/30 dark:text-teal-300',
};
