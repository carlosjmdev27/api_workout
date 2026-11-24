import { useMutation } from '@tanstack/react-query';
import type { PasswordChange, ProfileUpdate } from '@gym/shared';
import { authApi } from '../../services/auth.api';
import { useAuth } from '../auth/auth-context';

/** Saves name/email and pushes the new user into the session, so the header updates at once. */
export function useUpdateProfile() {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (input: ProfileUpdate) => authApi.updateProfile(input),
    onSuccess: updateUser,
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: (input: PasswordChange) => authApi.changePassword(input) });
}
