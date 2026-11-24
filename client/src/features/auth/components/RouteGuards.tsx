import type { JSX } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../../components/StatusViews';
import { useAuth } from '../auth-context';

/** Where the user wanted to go before being sent to /login. */
export interface LoginRedirectState {
  from?: string;
}

/** Private area: requires a validated session. */
export function ProtectedRoute(): JSX.Element {
  const { state, recheck } = useAuth();
  const location = useLocation();

  if (state.status === 'checking') return <LoadingState label="Comprobando tu sesión…" />;
  if (state.status === 'offline') {
    return <ErrorState message="No se pudo conectar con el servidor para comprobar tu sesión." onRetry={recheck} />;
  }
  if (state.status === 'anonymous') {
    // Expired session / deep link: come back here after login. Explicit logout: start fresh.
    const redirect: LoginRedirectState | undefined = state.loggedOut ? undefined : { from: `${location.pathname}${location.search}` };
    return <Navigate to="/login" replace state={redirect} />;
  }
  return <Outlet />;
}

/** Only same-app paths are followed after login (no open redirects). */
function safeTarget(state: unknown): string {
  const from = (state as LoginRedirectState | null)?.from;
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/';
}

/**
 * /login and /register: once there is a session, go to the page the user originally
 * asked for (or home). This is the ONLY post-login redirect: the forms do not navigate,
 * so two competing navigations can never race.
 */
export function PublicOnlyRoute(): JSX.Element {
  const { state } = useAuth();
  const location = useLocation();
  if (state.status === 'authenticated') return <Navigate to={safeTarget(location.state)} replace />;
  if (state.status === 'checking') return <LoadingState label="Comprobando tu sesión…" />;
  return <Outlet />;
}
