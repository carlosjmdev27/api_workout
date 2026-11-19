/** Cache keys of a single workout day and its history (used by workout/history screens). */
export const dayKeys = {
  all: ['days'] as const,
  detail: (dayId: string) => ['days', 'detail', dayId] as const,
  history: (dayId: string) => ['days', 'history', dayId] as const,
};
