import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { RoutineInput, RoutineSummary } from '@gym/shared';
import { routinesApi } from '../../services/routines.api';
import { dayKeys } from '../days/keys';

/** Cache keys: one list + one entry per routine detail (full tree). */
export const routineKeys = {
  list: ['routines', 'list'] as const,
  detail: (id: string) => ['routines', 'detail', id] as const,
};

/** Anything inside a routine changed: refresh its tree, the list counters and cached days. */
export function refreshRoutine(queryClient: QueryClient, routineId: string): void {
  void queryClient.invalidateQueries({ queryKey: routineKeys.detail(routineId) });
  void queryClient.invalidateQueries({ queryKey: routineKeys.list });
  void queryClient.invalidateQueries({ queryKey: dayKeys.all });
}

export function useRoutinesQuery() {
  return useQuery({ queryKey: routineKeys.list, queryFn: routinesApi.list });
}

export function useRoutineQuery(id: string) {
  return useQuery({
    queryKey: routineKeys.detail(id),
    queryFn: () => routinesApi.get(id),
    enabled: id !== '',
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RoutineInput) => routinesApi.create(input),
    onSuccess: (routine) => {
      queryClient.setQueryData(routineKeys.detail(routine.id), routine);
      void queryClient.invalidateQueries({ queryKey: routineKeys.list });
    },
  });
}

export function useUpdateRoutine(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RoutineInput) => routinesApi.update(id, input),
    onSuccess: (routine) => {
      queryClient.setQueryData(routineKeys.detail(id), routine);
      void queryClient.invalidateQueries({ queryKey: routineKeys.list });
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routinesApi.remove(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: routineKeys.detail(id), exact: true });
      // Drop it from the cached list right away so it never flashes after navigating back.
      queryClient.setQueryData<RoutineSummary[]>(routineKeys.list, (current) =>
        current?.filter((routine) => routine.id !== id),
      );
      void queryClient.invalidateQueries({ queryKey: routineKeys.list });
    },
  });
}
