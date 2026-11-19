import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SessionInput } from '@gym/shared';
import { daysApi } from '../../services/days.api';
import { sessionsApi } from '../../services/sessions.api';
import { dayKeys } from '../days/keys';

export function useDayQuery(dayId: string) {
  return useQuery({
    queryKey: dayKeys.detail(dayId),
    queryFn: () => daysApi.get(dayId),
    enabled: dayId !== '',
  });
}

export function useDayHistoryQuery(dayId: string) {
  return useQuery({
    queryKey: dayKeys.history(dayId),
    queryFn: () => sessionsApi.historyByDay(dayId),
    enabled: dayId !== '',
  });
}

export const sessionKeys = {
  detail: (sessionId: string) => ['sessions', sessionId] as const,
};

export function useSessionQuery(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => sessionsApi.get(sessionId),
    enabled: sessionId !== '',
  });
}

export function useCreateSession(dayId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SessionInput) => sessionsApi.create(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: dayKeys.history(dayId) }),
  });
}

export function useDeleteSession(dayId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => sessionsApi.remove(sessionId),
    onSuccess: (_result, sessionId) => {
      queryClient.removeQueries({ queryKey: sessionKeys.detail(sessionId) });
      void queryClient.invalidateQueries({ queryKey: dayKeys.history(dayId) });
    },
  });
}
