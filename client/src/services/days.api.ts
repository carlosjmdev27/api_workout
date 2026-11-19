import type { WorkoutDay, WorkoutDayDetail, WorkoutDayInput } from '@gym/shared';
import { request, requestVoid } from './http-client';

const dayPath = (dayId: string): string => `/days/${encodeURIComponent(dayId)}`;
const routineDaysPath = (routineId: string): string =>
  `/routines/${encodeURIComponent(routineId)}/days`;

export const daysApi = {
  get: (dayId: string): Promise<WorkoutDayDetail> => request('GET', dayPath(dayId)),

  create: (routineId: string, input: WorkoutDayInput): Promise<WorkoutDay> =>
    request('POST', routineDaysPath(routineId), input),

  rename: (dayId: string, input: WorkoutDayInput): Promise<WorkoutDay> =>
    request('PUT', dayPath(dayId), input),

  remove: (dayId: string): Promise<void> => requestVoid('DELETE', dayPath(dayId)),

  reorder: (routineId: string, dayIds: string[]): Promise<WorkoutDay[]> =>
    request('PUT', `${routineDaysPath(routineId)}/order`, { dayIds }),
};
