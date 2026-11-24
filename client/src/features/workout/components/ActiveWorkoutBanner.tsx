import type { JSX } from 'react';
import { Dumbbell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { activeWorkoutPath, useActiveWorkout } from '../active-workout';
import { ActiveWorkoutTimer } from './ActiveWorkoutTimer';

/** Shown on every page except the workout itself while a workout is in progress. */
export function ActiveWorkoutBanner(): JSX.Element | null {
  const active = useActiveWorkout();
  const { pathname } = useLocation();
  if (!active || pathname === activeWorkoutPath(active.dayId)) return null;

  return (
    <Link
      to={activeWorkoutPath(active.dayId)}
      className="flex items-center justify-between gap-3 bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary-foreground sm:px-6"
    >
      <span className="flex min-w-0 items-center gap-2">
        <Dumbbell className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Entrenamiento en curso: <strong>{active.dayName}</strong></span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <ActiveWorkoutTimer startedAt={active.startedAt} variant="inverse" />
        <span className="font-semibold underline underline-offset-2">Reanudar</span>
      </span>
    </Link>
  );
}
