import type { JSX } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useCurrentUser } from '../auth-context';

/** Discreet user name + "Salir" in the top bar. */
export function UserMenu(): JSX.Element {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1">
      <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex" title={user.email}>
        <UserRound className="h-4 w-4" aria-hidden="true" />
        {user.name}
      </span>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate('/login', { replace: true });
        }}
        aria-label={`Salir: cerrar la sesión de ${user.name}`}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span>Salir</span>
      </button>
    </div>
  );
}
