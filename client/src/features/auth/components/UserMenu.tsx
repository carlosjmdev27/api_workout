import type { JSX } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCurrentUser } from '../auth-context';
import { useLogout } from '../useLogout';

const ITEM =
  'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring';

/** Top bar: user (link to /profile, highlighted while there) + "Salir". */
export function UserMenu(): JSX.Element {
  const user = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex items-center gap-1">
      <NavLink
        to="/profile"
        title={`Tu perfil (${user.email})`}
        className={({ isActive }) =>
          `${ITEM} ${isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
        }
      >
        <UserRound className="h-4 w-4" aria-hidden="true" />
        {/* Mobile: only the icon is shown, the name stays available to screen readers. */}
        <span className="sr-only sm:not-sr-only">{user.name}</span>
        <span className="sr-only">: tu perfil</span>
      </NavLink>
      <button
        type="button"
        onClick={logout}
        aria-label={`Salir: cerrar la sesión de ${user.name}`}
        className={`${ITEM} text-muted-foreground hover:bg-muted hover:text-foreground`}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span>Salir</span>
      </button>
    </div>
  );
}
