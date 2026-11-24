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
  // Dark theme: translucent tint + light text (each ≥ 7:1 on the card colour).
  warmup: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  normal: 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/30',
  topset: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  backoff: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  restpause: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  dropset: 'bg-teal-500/15 text-teal-300 ring-teal-500/30',
};
