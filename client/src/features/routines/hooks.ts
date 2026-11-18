import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { routinesApi } from '../../services/routines.api';
import type { CreateRoutineInput, UpdateRoutineInput } from '../../types/routine';

/** Cache keys: one list + one entry per routine detail. */
export const routineKeys = {
  list: ['routines', 'list'] as const,
  detail: (id: string) => ['routines', 'detail', id] as const,
};

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
    mutationFn: (input: CreateRoutineInput) => routinesApi.create(input),
    onSuccess: (routine) => {
      queryClient.setQueryData(routineKeys.detail(routine.id), routine);
      void queryClient.invalidateQueries({ queryKey: routineKeys.list });
    },
  });
}

export function useUpdateRoutine(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateRoutineInput) => routinesApi.update(id, input),
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
      void queryClient.invalidateQueries({ queryKey: routineKeys.list });
    },
  });
}
