import type { JSX, ReactNode } from 'react';
import { Dumbbell } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

interface LayoutProps {
  /** Optional strip under the header (e.g. "workout in progress"). Injected by App
   *  so this generic component does not depend on any feature. */
  banner?: ReactNode;
  /** Right side of the top bar (e.g. the user menu). */
  actions?: ReactNode;
}

/** App shell: top bar + centered content area. */
export function Layout({ banner, actions }: LayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Dumbbell className="h-6 w-6 text-primary" aria-hidden="true" />
            AuraWorkout
          </Link>
          {actions}
        </div>
      </header>
      {banner}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
