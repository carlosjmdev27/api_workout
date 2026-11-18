import type { Exercise, ExerciseInput, ExerciseUpdate } from '../types/exercise';
import { request, requestVoid } from './http-client';

const basePath = (routineId: string): string =>
  `/routines/${encodeURIComponent(routineId)}/exercises`;

const exercisePath = (routineId: string, exerciseId: string): string =>
  `${basePath(routineId)}/${encodeURIComponent(exerciseId)}`;

export const exercisesApi = {
  create: (routineId: string, input: ExerciseInput): Promise<Exercise> =>
    request('POST', basePath(routineId), input),

  update: (routineId: string, exerciseId: string, input: ExerciseUpdate): Promise<Exercise> =>
    request('PUT', exercisePath(routineId, exerciseId), input),

  remove: (routineId: string, exerciseId: string): Promise<void> =>
    requestVoid('DELETE', exercisePath(routineId, exerciseId)),

  reorder: (routineId: string, exerciseIds: string[]): Promise<Exercise[]> =>
    request('PUT', `${basePath(routineId)}/order`, { exerciseIds }),
};
