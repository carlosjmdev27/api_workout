import type { JSX } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/Button';
import { ActiveWorkoutTimer } from './ActiveWorkoutTimer';

interface WorkoutTopBarProps {
  dayName: string;
  routineName: string;
  startedAt: string;
  completed: number;
  total: number;
  onCancel: () => void;
}

/** Sticky bar under the app header: what is being trained, for how long, and how far along. */
export function WorkoutTopBar({ dayName, routineName, startedAt, completed, total, onCancel }: WorkoutTopBarProps): JSX.Element {
  return (
    <div className="sticky top-14 z-10 -mx-4 mb-4 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{dayName}</p>
          <p className="truncate text-xs text-slate-500">
            {routineName} · <span className="tabular-nums">{completed}/{total}</span> series
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ActiveWorkoutTimer startedAt={startedAt} />
          <Button variant="secondary" size="sm" icon={X} onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
