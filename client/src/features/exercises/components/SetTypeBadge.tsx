import type { JSX } from 'react';
import type { SetType } from '@gym/shared';
import { Badge } from '@/components/ui/badge';
import { SET_TYPE_LABELS, SET_TYPE_SHORT, SET_TYPE_STYLES } from '../set-type-styles';

interface SetTypeBadgeProps {
  type: SetType;
  /** Abbreviation (TOP, BACK…) with the full name as tooltip and accessible name. */
  compact?: boolean;
}

/** shadcn/ui Badge tinted per set type. */
export function SetTypeBadge({ type, compact = false }: SetTypeBadgeProps): JSX.Element {
  const tint = `rounded-md ring-1 ring-inset ${SET_TYPE_STYLES[type]}`;
  if (!compact) {
    return <Badge variant="outline" className={`${tint} border-0`}>{SET_TYPE_LABELS[type]}</Badge>;
  }
  return (
    <Badge asChild variant="outline" className={`${tint} h-[18px] border-0 px-1.5 text-[11px] font-semibold tracking-wide no-underline`}>
      <abbr title={SET_TYPE_LABELS[type]}>
        <span aria-hidden="true">{SET_TYPE_SHORT[type]}</span>
        <span className="sr-only">{SET_TYPE_LABELS[type]}</span>
      </abbr>
    </Badge>
  );
}
