import type { JSX } from 'react';
import { Dumbbell } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

/** App shell: top bar + centered content area. */
export function Layout(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
            <Dumbbell className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            Gym Routines
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
