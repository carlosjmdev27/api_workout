import type { RoutineDetail, RoutineInput, RoutineSummary, RoutineUpdate } from '@gym/shared';
import { request, requestVoid } from './http-client';

const routinePath = (id: string): string => `/routines/${encodeURIComponent(id)}`;

export const routinesApi = {
  list: (): Promise<RoutineSummary[]> => request('GET', '/routines'),

  get: (id: string): Promise<RoutineDetail> => request('GET', routinePath(id)),

  create: (input: RoutineInput): Promise<RoutineDetail> => request('POST', '/routines', input),

  update: (id: string, input: RoutineUpdate): Promise<RoutineDetail> =>
    request('PUT', routinePath(id), input),

  remove: (id: string): Promise<void> => requestVoid('DELETE', routinePath(id)),
};
