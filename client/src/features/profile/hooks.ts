import { useMutation } from '@tanstack/react-query';
import type { PersonalProfileUpdate } from '@gym/shared';
import { profileApi } from '../../services/profile.api';
import { useAuth } from '../auth/auth-context';

/** Saves the personal data and pushes the new user into the session (AuthContext). */
export function useUpdatePersonal() {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (input: PersonalProfileUpdate) => profileApi.updatePersonal(input),
    onSuccess: updateUser,
  });
}
