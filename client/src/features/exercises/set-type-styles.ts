import type { SetType } from '@gym/shared';

export const SET_TYPE_LABELS: Record<SetType, string> = {
  warmup: 'Aproximación',
  normal: 'Normal',
  topset: 'Top set',
  backoff: 'Back-off',
  restpause: 'Rest-pause',
  dropset: 'Drop set',
};

/** Subtle colour per set type (full class strings so Tailwind can detect them). */
export const SET_TYPE_STYLES: Record<SetType, string> = {
  warmup: 'bg-sky-50 text-sky-700 ring-sky-200',
  normal: 'bg-slate-100 text-slate-700 ring-slate-200',
  topset: 'bg-rose-50 text-rose-700 ring-rose-200',
  backoff: 'bg-amber-50 text-amber-800 ring-amber-200',
  restpause: 'bg-violet-50 text-violet-700 ring-violet-200',
  dropset: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};
