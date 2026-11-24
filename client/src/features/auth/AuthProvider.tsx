import { useCallback, useEffect, useMemo, useState, type JSX, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthResponse, LoginInput, RegisterInput } from '@gym/shared';
import { authApi } from '../../services/auth.api';
import { clearToken, getToken, onSessionExpired, setToken } from '../../services/auth-token';
import { ApiRequestError } from '../../services/http-client';
import { clearActiveWorkout } from '../workout/active-workout';
import { AuthContext, type AuthContextValue, type AuthState } from './auth-context';

const LAST_USER_KEY = 'gym_last_user_id';

/** A workout draft in progress belongs to whoever was logged in on this device. */
function forgetDraftIfOtherUser(userId: string): void {
  try {
    if (localStorage.getItem(LAST_USER_KEY) !== userId) clearActiveWorkout();
    localStorage.setItem(LAST_USER_KEY, userId);
  } catch {
    // Storage unavailable: there is no persisted draft either.
  }
}

/** Session state for the whole app: validates the stored token on start and reacts to 401s. */
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>(() => (getToken() ? { status: 'checking' } : { status: 'anonymous' }));

  const recheck = useCallback((): void => {
    if (!getToken()) return setState({ status: 'anonymous' });
    setState({ status: 'checking' });
    authApi
      .me()
      .then((user) => setState({ status: 'authenticated', user }))
      .catch((error: unknown) => {
        const offline = error instanceof ApiRequestError && error.code === 'NETWORK_ERROR' && getToken() !== null;
        setState(offline ? { status: 'offline' } : { status: 'anonymous', expired: true });
      });
  }, []);

  useEffect(recheck, [recheck]);

  useEffect(
    () =>
      onSessionExpired(() => {
        queryClient.clear(); // Never show cached data of a closed session.
        setState({ status: 'anonymous', expired: true });
      }),
    [queryClient],
  );

  const start = useCallback(
    ({ token, user }: AuthResponse): void => {
      forgetDraftIfOtherUser(user.id);
      setToken(token);
      queryClient.clear();
      setState({ status: 'authenticated', user });
    },
    [queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      recheck,
      login: async (input: LoginInput) => start(await authApi.login(input)),
      register: async (input: RegisterInput) => start(await authApi.register(input)),
      logout: () => {
        clearToken();
        queryClient.clear();
        setState({ status: 'anonymous', loggedOut: true });
      },
      updateUser: (user) => setState((current) => (current.status === 'authenticated' ? { status: 'authenticated', user } : current)),
    }),
    [state, recheck, start, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
