import { createContext, useContext } from 'react';
import type { LoginInput, RegisterInput, RegisterResponse, User } from '@gym/shared';

export type AuthState =
  | { status: 'checking' }
  /**
   * `expired`: the API rejected the token, so the login page can explain why.
   * `loggedOut`: the user chose to leave, so the next login starts at home, not where they were.
   */
  | { status: 'anonymous'; expired?: boolean; loggedOut?: boolean }
  | { status: 'authenticated'; user: User }
  /** A token exists but the API could not be reached to validate it. */
  | { status: 'offline' };

export interface AuthContextValue {
  state: AuthState;
  login: (input: LoginInput) => Promise<void>;
  /** Creates an unverified account: no session until the email is confirmed. */
  register: (input: RegisterInput) => Promise<RegisterResponse>;
  logout: () => void;
  /** Replaces the logged-in user (after editing the profile): the header updates at once. */
  updateUser: (user: User) => void;
  /** Validates the stored token again (after being offline). */
  recheck: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}

/** The logged-in user. Only valid inside protected routes. */
export function useCurrentUser(): User {
  const { state } = useAuth();
  if (state.status !== 'authenticated') throw new Error('useCurrentUser outside a protected route');
  return state.user;
}
