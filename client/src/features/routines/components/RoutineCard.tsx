import type { JSX } from 'react';
import { CalendarClock, ChevronRight, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RoutineSummary } from '../../../types/routine';
import { formatDate, pluralize } from '../../../utils/format';

export function RoutineCard({ routine }: { routine: RoutineSummary }): JSX.Element {
  return (
    <Link
      to={`/routines/${routine.id}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="break-words font-semibold text-slate-900 group-hover:text-indigo-700">
          {routine.name}
        </h2>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
          aria-hidden="true"
        />
      </div>
      {routine.description && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{routine.description}</p>
      )}
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
          {pluralize(routine.exerciseCount, 'ejercicio', 'ejercicios')}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(routine.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
