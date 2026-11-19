import type { JSX } from 'react';
import { ArrowLeft, History } from 'lucide-react';
import type { WorkoutSession, WorkoutSessionDetail } from '@gym/shared';
import { useParams } from 'react-router-dom';
import { LinkButton } from '../../../components/LinkButton';
import { PageHeader } from '../../../components/PageHeader';
import { ErrorState, LoadingState } from '../../../components/StatusViews';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { formatDateTime } from '../../../utils/format';
import { useDayHistoryQuery, useSessionQuery } from '../../workout/hooks';
import { compareExercises, compareTotals, previousSessionOf } from '../compare';
import { ExerciseComparisonTable } from '../components/ExerciseComparisonTable';
import { SessionSetsList } from '../components/SessionSetsList';
import { SummaryTiles } from '../components/SummaryTiles';

function Summary({ session, history }: { session: WorkoutSessionDetail; history: WorkoutSession[] }): JSX.Element {
  const previous = previousSessionOf(session, history);
  const exercises = compareExercises(session, history);
  const records = exercises.filter((exercise) => exercise.isRecord).length;

  return (
    <div className="space-y-6">
      <PageHeader title={`Resumen · ${session.dayName}`} description={`${session.routineName} · ${formatDateTime(session.completedAt)}`}>
        <p className="pt-1 text-sm text-slate-500">
          {previous ? `Comparado con tu sesión del ${formatDateTime(previous.completedAt)}.` : 'Primera sesión registrada de esta tabla.'}
          {records > 0 && ` ${records === 1 ? 'Has batido 1 récord' : `Has batido ${records} récords`} de e1RM.`}
        </p>
      </PageHeader>

      <SummaryTiles durationSeconds={session.durationSeconds} totals={compareTotals(session, previous)} />

      <section aria-labelledby="compare-title" className="space-y-3">
        <h2 id="compare-title" className="text-lg font-semibold text-slate-900">Comparativa por ejercicio</h2>
        <ExerciseComparisonTable rows={exercises} />
      </section>

      <section aria-labelledby="sets-title" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 id="sets-title" className="text-lg font-semibold text-slate-900">Series realizadas</h2>
        <SessionSetsList sets={session.sets} />
        {session.notes && <p className="whitespace-pre-line rounded-lg bg-slate-50 p-2 text-sm text-slate-600">{session.notes}</p>}
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <LinkButton to={`/days/${session.workoutDayId}/history`} icon={History}>Ver historial de la tabla</LinkButton>
        <LinkButton to={`/routines/${session.routineId}?day=${session.workoutDayId}`} variant="secondary" icon={ArrowLeft}>Volver a la rutina</LinkButton>
      </div>
    </div>
  );
}

export function SessionSummaryPage(): JSX.Element {
  const { sessionId = '' } = useParams();
  const session = useSessionQuery(sessionId);
  const history = useDayHistoryQuery(session.data?.workoutDayId ?? '');
  useDocumentTitle(session.data ? `Resumen: ${session.data.dayName}` : 'Resumen');

  if (session.isPending) return <LoadingState label="Cargando resumen…" />;
  if (session.isError) return <ErrorState message={getErrorMessage(session.error)} backTo="/" />;
  if (history.isPending) return <LoadingState label="Comparando con sesiones anteriores…" />;
  if (history.isError) return <ErrorState message={getErrorMessage(history.error)} onRetry={() => void history.refetch()} />;
  return <Summary session={session.data} history={history.data} />;
}
