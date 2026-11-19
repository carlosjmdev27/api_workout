import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { WorkoutDayInput } from '@gym/shared';
import { daysApi } from '../../services/days.api';
import { refreshRoutine } from '../routines/hooks';

/** Mutations on the workout days ("tablas") of one routine. */
export function useCreateDay(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkoutDayInput) => daysApi.create(routineId, input),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}

interface RenameVariables {
  dayId: string;
  input: WorkoutDayInput;
}

export function useRenameDay(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dayId, input }: RenameVariables) => daysApi.rename(dayId, input),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}

export function useDeleteDay(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dayId: string) => daysApi.remove(dayId),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}

export function useReorderDays(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dayIds: string[]) => daysApi.reorder(routineId, dayIds),
    onSuccess: () => refreshRoutine(queryClient, routineId),
  });
}
