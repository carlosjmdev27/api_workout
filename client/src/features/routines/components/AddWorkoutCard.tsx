import type { JSX } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Last cell of the routines grid: same size as a RoutineCard (the grid uses equal-height
 * rows), dashed border, subtle hover. The only "new routine" action once routines exist.
 */
export function AddWorkoutCard({ to }: { to: string }): JSX.Element {
  return (
    <Link
      to={to}
      className="group flex h-full min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input p-5 text-muted-foreground transition hover:border-primary/60 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition group-hover:bg-primary/15">
        <Plus className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-sm font-medium">Nueva rutina</span>
    </Link>
  );
}
