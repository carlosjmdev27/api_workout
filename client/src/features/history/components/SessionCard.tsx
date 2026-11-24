import type { JSX } from 'react';
import { ChevronDown, FileBarChart, Trash2 } from 'lucide-react';
import type { WorkoutSession } from '@gym/shared';
import { IconButton } from '../../../components/IconButton';
import { LinkButton } from '../../../components/LinkButton';
import { formatDateTime, formatDuration, formatWeight } from '../../../utils/format';
import { useWeightUnit } from '../../auth/useWeightUnit';
import { sessionTotals } from '../stats';
import { SessionSetsList } from './SessionSetsList';

function Metric({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

interface SessionCardProps {
  session: WorkoutSession;
  onDelete: () => void;
}

/** One past session: summary metrics (always visible) + expandable logged sets. */
export function SessionCard({ session, onDelete }: SessionCardProps): JSX.Element {
  const totals = sessionTotals(session);
  const unit = useWeightUnit();

  return (
    <li className="rounded-2xl border border-border bg-card shadow-sm">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform group-open:rotate-180" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{formatDateTime(session.completedAt)}</p>
            <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
              <Metric label="Duración" value={session.durationSeconds === null ? '—' : formatDuration(session.durationSeconds)} />
              <Metric label="Series hechas" value={String(totals.completedSets)} />
              <Metric label="Reps totales" value={String(totals.totalReps)} />
              <Metric label="Peso movido" value={formatWeight(totals.volume, unit)} />
            </dl>
          </div>
        </summary>
        <div className="space-y-3 border-t border-border/60 px-4 pb-4 pt-3">
          <SessionSetsList sets={session.sets} />
          {session.notes && <p className="whitespace-pre-line rounded-lg bg-muted/50 p-2 text-sm text-muted-foreground">{session.notes}</p>}
          <div className="flex items-center justify-between">
            <LinkButton to={`/sessions/${session.id}`} variant="secondary" size="sm" icon={FileBarChart}>Ver resumen</LinkButton>
            <IconButton icon={Trash2} tone="danger" label="Eliminar esta sesión" onClick={onDelete} />
          </div>
        </div>
      </details>
    </li>
  );
}
