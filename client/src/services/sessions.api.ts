import type { SessionInput, WorkoutSession, WorkoutSessionDetail } from '@gym/shared';
import { request, requestVoid } from './http-client';

const sessionPath = (sessionId: string): string => `/sessions/${encodeURIComponent(sessionId)}`;

export const sessionsApi = {
  create: (input: SessionInput): Promise<WorkoutSession> => request('POST', '/sessions', input),

  get: (sessionId: string): Promise<WorkoutSessionDetail> => request('GET', sessionPath(sessionId)),

  /** Latest sessions of a day, newest first. */
  historyByDay: (dayId: string): Promise<WorkoutSession[]> =>
    request('GET', `/days/${encodeURIComponent(dayId)}/history`),

  remove: (sessionId: string): Promise<void> => requestVoid('DELETE', sessionPath(sessionId)),
};
