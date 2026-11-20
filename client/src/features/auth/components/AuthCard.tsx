import type { JSX, ReactNode } from 'react';
import { Dumbbell } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Link to the other auth screen. */
  footer: ReactNode;
}

/** Minimal centered card shared by the login and register screens. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Dumbbell className="h-7 w-7 text-indigo-600" aria-hidden="true" />
        Gym Routines
      </div>
      <main className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-5">{children}</div>
      </main>
      <p className="mt-4 text-sm text-slate-600">{footer}</p>
    </div>
  );
}
