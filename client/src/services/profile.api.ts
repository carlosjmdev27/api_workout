import type { PersonalProfileUpdate, PhysicalProfileUpdate, User, WeightLog, WeightLogInput } from '@gym/shared';
import { request } from './http-client';

/** Weight-log writes answer the entry (or null on delete) + the user with the refreshed current weight. */
export interface WeightLogResult {
  log: WeightLog | null;
  user: User;
}

export const profileApi = {
  updatePersonal: (input: PersonalProfileUpdate): Promise<User> => request('PUT', '/profile/personal', input),
  updatePhysical: (input: PhysicalProfileUpdate): Promise<User> => request('PUT', '/profile/physical', input),
  weightLogs: (): Promise<WeightLog[]> => request('GET', '/profile/weight-logs'),
  addWeightLog: (input: WeightLogInput): Promise<WeightLogResult> => request('POST', '/profile/weight-logs', input),
  deleteWeightLog: (logId: string): Promise<WeightLogResult> => request('DELETE', `/profile/weight-logs/${encodeURIComponent(logId)}`),
};
