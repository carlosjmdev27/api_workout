import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context';

/** Ends the session and goes to /login (header and profile page share it). */
export function useLogout(): () => void {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return () => {
    logout();
    navigate('/login', { replace: true });
  };
}
