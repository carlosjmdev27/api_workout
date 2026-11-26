import type { JSX } from 'react';
import { ChevronDown, LineChart, LogOut, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUser } from '../auth-context';
import { useLogout } from '../useLogout';

/** Account sections, in the order the menu must show them. */
const SECTIONS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/profile', label: 'Perfil', icon: UserRound },
  { to: '/progress', label: 'Mi progreso', icon: LineChart },
  { to: '/security', label: 'Seguridad', icon: ShieldCheck },
];

/**
 * Top bar: "@username" opens the account menu (Radix DropdownMenu: arrow keys, Esc, focus
 * return and closing on outside click are built in). Perfil · Mi progreso · Seguridad ·
 * separator · Cerrar sesión.
 */
export function UserMenu(): JSX.Element {
  const user = useCurrentUser();
  const logout = useLogout();
  const { pathname } = useLocation();
  const inAccount = SECTIONS.some((section) => section.to === pathname);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menú de la cuenta de @${user.username}`}
        className={`flex max-w-[11rem] items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring data-[state=open]:bg-muted data-[state=open]:text-foreground sm:max-w-[16rem] ${
          inAccount ? 'bg-muted text-foreground' : 'text-muted-foreground'
        }`}
      >
        <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">@{user.username}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-48">
        {SECTIONS.map(({ to, label, icon: Icon }) => (
          <DropdownMenuItem key={to} asChild>
            <Link to={to} aria-current={pathname === to ? 'page' : undefined} className={pathname === to ? 'font-semibold' : undefined}>
              <Icon aria-hidden="true" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={logout}>
          <LogOut aria-hidden="true" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
