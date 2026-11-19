import type { JSX } from 'react';
import { SET_TYPES, isSetType, type SetType } from '@gym/shared';
import { SET_TYPE_LABELS, SET_TYPE_STYLES } from '../set-type-styles';

interface SetTypeSelectProps {
  value: SetType;
  label: string;
  onChange: (type: SetType) => void;
}

/** Native select (accessible, mobile-friendly) tinted with the colour of the chosen type. */
export function SetTypeSelect({ value, label, onChange }: SetTypeSelectProps): JSX.Element {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => {
        if (isSetType(event.target.value)) onChange(event.target.value);
      }}
      className={`h-9 w-full cursor-pointer rounded-lg border-0 px-2 text-sm font-medium ring-1 ring-inset focus:outline-2 focus:outline-indigo-600 ${SET_TYPE_STYLES[value]}`}
    >
      {SET_TYPES.map((type) => (
        <option key={type} value={type} className="bg-white text-slate-900">
          {SET_TYPE_LABELS[type]}
        </option>
      ))}
    </select>
  );
}
