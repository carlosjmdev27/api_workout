import type { JSX } from 'react';
import type { SetType } from '@gym/shared';
import { SET_TYPE_LABELS, SET_TYPE_SHORT, SET_TYPE_STYLES } from '../set-type-styles';

interface SetTypeBadgeProps {
  type: SetType;
  /** Abbreviation (TOP, BACK…) with the full name as tooltip and accessible name. */
  compact?: boolean;
}

export function SetTypeBadge({ type, compact = false }: SetTypeBadgeProps): JSX.Element {
  const base = `inline-flex items-center rounded-md ring-1 ring-inset ${SET_TYPE_STYLES[type]}`;
  if (!compact) {
    return <span className={`${base} px-2 py-0.5 text-xs font-medium`}>{SET_TYPE_LABELS[type]}</span>;
  }
  return (
    <abbr title={SET_TYPE_LABELS[type]} className={`${base} px-1.5 py-px text-[11px] font-semibold tracking-wide no-underline`}>
      <span aria-hidden="true">{SET_TYPE_SHORT[type]}</span>
      <span className="sr-only">{SET_TYPE_LABELS[type]}</span>
    </abbr>
  );
}
