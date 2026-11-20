import type { JSX } from 'react';
import { SET_TYPES, isSetType, type SetType } from '@gym/shared';
import { SET_TYPE_LABELS, SET_TYPE_SHORT, SET_TYPE_STYLES } from '../set-type-styles';

interface SetTypeSelectProps {
  value: SetType;
  label: string;
  /** Abbreviated options (TOP, BACK…) for dense rows: show a legend next to it. */
  compact?: boolean;
  onChange: (type: SetType) => void;
}

/** Native select (accessible, mobile-friendly) tinted with the colour of the chosen type. */
export function SetTypeSelect({ value, label, compact = false, onChange }: SetTypeSelectProps): JSX.Element {
  return (
    <select
      aria-label={label}
      title={SET_TYPE_LABELS[value]}
      value={value}
      onChange={(event) => {
        if (isSetType(event.target.value)) onChange(event.target.value);
      }}
      className={`w-full cursor-pointer rounded-md border-0 font-medium ring-1 ring-inset focus:outline-2 focus:outline-indigo-600 ${
        compact ? 'h-8 px-1 text-xs tracking-wide' : 'h-9 px-2 text-sm'
      } ${SET_TYPE_STYLES[value]}`}
    >
      {SET_TYPES.map((type) => (
        <option key={type} value={type} className="bg-white text-slate-900">
          {compact ? SET_TYPE_SHORT[type] : SET_TYPE_LABELS[type]}
        </option>
      ))}
    </select>
  );
}
