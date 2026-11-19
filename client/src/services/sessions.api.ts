import type { SessionInput, WorkoutSession } from '@gym/shared';
import { request, requestVoid } from './http-client';

export const sessionsApi = {
  create: (input: SessionInput): Promise<WorkoutSession> => request('POST', '/sessions', input),

  /** Latest sessions of a day, newest first. */
  historyByDay: (dayId: string): Promise<WorkoutSession[]> =>
    request('GET', `/days/${encodeURIComponent(dayId)}/history`),

  remove: (sessionId: string): Promise<void> =>
    requestVoid('DELETE', `/sessions/${encodeURIComponent(sessionId)}`),
};
