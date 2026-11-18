import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { exercisesApi } from '../../services/exercises.api';
import type { Exercise, ExerciseInput, ExerciseUpdate } from '../../types/exercise';
import type { RoutineWithExercises } from '../../types/routine';
import { routineKeys } from '../routines/hooks';

/** Exercises live inside the routine detail; refresh it and the list counts. */
function refreshRoutine(queryClient: QueryClient, routineId: string): void {
  void queryClient.invalidateQueries({ queryKey: routineKeys.detail(routineId) });
  void queryClient.invalidateQueries({ queryKey: routineKeys.list });
}

export function useCreateExercise(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExerciseInput) => exercisesApi.create(routineId, input),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}

interface UpdateVariables {
  exerciseId: string;
  input: ExerciseUpdate;
}

export function useUpdateExercise(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, input }: UpdateVariables) =>
      exercisesApi.update(routineId, exerciseId, input),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}

export function useDeleteExercise(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) => exercisesApi.remove(routineId, exerciseId),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}

export function useReorderExercises(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseIds: string[]) => exercisesApi.reorder(routineId, exerciseIds),
    onSuccess: (exercises: Exercise[]) => {
      // Apply the server order immediately, then refresh in the background.
      queryClient.setQueryData<RoutineWithExercises>(routineKeys.detail(routineId), (current) =>
        current ? { ...current, exercises } : current,
      );
      refreshRoutine(queryClient, routineId);
    },
  });
}
