import { useMutation } from '@tanstack/react-query';
import type { IdentityUpdate, PasswordChange } from '@gym/shared';
import { authApi } from '../../services/auth.api';
import { useAuth } from '../auth/auth-context';

/** Saves username + email; the header's "@username" updates at once (AuthContext). */
export function useUpdateIdentity() {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (input: IdentityUpdate) => authApi.updateIdentity(input),
    onSuccess: updateUser,
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: (input: PasswordChange) => authApi.changePassword(input) });
}
