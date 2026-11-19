import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DayExerciseInput } from '@gym/shared';
import { exercisesApi } from '../../services/exercises.api';
import { refreshRoutine } from '../routines/hooks';

/** Mutations on the exercises of a day. All refresh the parent routine tree. */
export function useCreateExercise(routineId: string, dayId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DayExerciseInput) => exercisesApi.create(dayId, input),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}

interface UpdateVariables {
  exerciseId: string;
  input: DayExerciseInput;
}

export function useUpdateExercise(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, input }: UpdateVariables) => exercisesApi.update(exerciseId, input),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}

export function useDeleteExercise(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) => exercisesApi.remove(exerciseId),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}

export function useReorderExercises(routineId: string, dayId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseIds: string[]) => exercisesApi.reorder(dayId, exerciseIds),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}
