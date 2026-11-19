import type { JSX } from 'react';
import type { SetType } from '@gym/shared';
import { SET_TYPE_LABELS, SET_TYPE_STYLES } from '../set-type-styles';

export function SetTypeBadge({ type }: { type: SetType }): JSX.Element {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${SET_TYPE_STYLES[type]}`}
    >
      {SET_TYPE_LABELS[type]}
    </span>
  );
}
