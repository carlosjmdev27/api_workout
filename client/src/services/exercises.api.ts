import type { DayExercise, DayExerciseInput, DayExerciseUpdate } from '@gym/shared';
import { request, requestVoid } from './http-client';

const exercisePath = (exerciseId: string): string => `/exercises/${encodeURIComponent(exerciseId)}`;
const dayExercisesPath = (dayId: string): string => `/days/${encodeURIComponent(dayId)}/exercises`;

export const exercisesApi = {
  create: (dayId: string, input: DayExerciseInput): Promise<DayExercise> =>
    request('POST', dayExercisesPath(dayId), input),

  update: (exerciseId: string, input: DayExerciseUpdate): Promise<DayExercise> =>
    request('PUT', exercisePath(exerciseId), input),

  remove: (exerciseId: string): Promise<void> => requestVoid('DELETE', exercisePath(exerciseId)),

  reorder: (dayId: string, exerciseIds: string[]): Promise<DayExercise[]> =>
    request('PUT', `${dayExercisesPath(dayId)}/order`, { exerciseIds }),
};
