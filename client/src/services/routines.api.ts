import type {
  CreateRoutineInput,
  RoutineSummary,
  RoutineWithExercises,
  UpdateRoutineInput,
} from '../types/routine';
import { request, requestVoid } from './http-client';

const routinePath = (id: string): string => `/routines/${encodeURIComponent(id)}`;

export const routinesApi = {
  list: (): Promise<RoutineSummary[]> => request('GET', '/routines'),

  get: (id: string): Promise<RoutineWithExercises> => request('GET', routinePath(id)),

  create: (input: CreateRoutineInput): Promise<RoutineWithExercises> =>
    request('POST', '/routines', input),

  update: (id: string, input: UpdateRoutineInput): Promise<RoutineWithExercises> =>
    request('PUT', routinePath(id), input),

  remove: (id: string): Promise<void> => requestVoid('DELETE', routinePath(id)),
};
