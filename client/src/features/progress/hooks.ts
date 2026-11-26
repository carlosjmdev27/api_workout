import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PhysicalProfileUpdate, WeightLog, WeightLogInput } from '@gym/shared';
import { profileApi, type WeightLogResult } from '../../services/profile.api';
import { useAuth } from '../auth/auth-context';

const WEIGHT_LOGS_KEY = ['profile', 'weight-logs'] as const;

export function useWeightLogs() {
  return useQuery<WeightLog[]>({ queryKey: WEIGHT_LOGS_KEY, queryFn: profileApi.weightLogs });
}

/** Height + preferred unit: the whole app relabels its weights at once (AuthContext). */
export function useUpdatePhysical() {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (input: PhysicalProfileUpdate) => profileApi.updatePhysical(input),
    onSuccess: updateUser,
  });
}

/** Shared by add / delete: new current weight into the session + refetch the history. */
function useWeightLogWrite<T>(mutationFn: (input: T) => Promise<WeightLogResult>) {
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async ({ user }) => {
      updateUser(user);
      await queryClient.invalidateQueries({ queryKey: WEIGHT_LOGS_KEY });
    },
  });
}

export function useAddWeightLog() {
  return useWeightLogWrite((input: WeightLogInput) => profileApi.addWeightLog(input));
}

export function useDeleteWeightLog() {
  return useWeightLogWrite((logId: string) => profileApi.deleteWeightLog(logId));
}
