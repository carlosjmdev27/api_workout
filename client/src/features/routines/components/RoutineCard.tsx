import type { JSX } from 'react';
import { CalendarClock, ChevronRight, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RoutineSummary } from '@gym/shared';
import { formatDate, pluralize } from '../../../utils/format';

export function RoutineCard({ routine }: { routine: RoutineSummary }): JSX.Element {
  return (
    <Link
      to={`/routines/${routine.id}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="break-words font-semibold text-foreground group-hover:text-primary">
          {routine.name}
        </h2>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-primary/80"
          aria-hidden="true"
        />
      </div>
      {routine.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{routine.description}</p>
      )}
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
          {pluralize(routine.dayCount, 'tabla', 'tablas')}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(routine.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
