/** Allowed set types, in the order they usually appear in a workout. */
export const SET_TYPES = ['warmup', 'normal', 'topset', 'backoff', 'restpause', 'dropset'] as const;

export type SetType = (typeof SET_TYPES)[number];

export function isSetType(value: string): value is SetType {
  return (SET_TYPES as readonly string[]).includes(value);
}
