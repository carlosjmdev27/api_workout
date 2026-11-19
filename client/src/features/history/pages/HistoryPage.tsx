import { useState, type JSX } from 'react';
import { History, Play } from 'lucide-react';
import type { WorkoutDayDetail, WorkoutSession } from '@gym/shared';
import { useParams } from 'react-router-dom';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { LinkButton } from '../../../components/LinkButton';
import { PageHeader } from '../../../components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../../../components/StatusViews';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { activeWorkoutPath } from '../../workout/active-workout';
import { useDayHistoryQuery, useDayQuery, useDeleteSession } from '../../workout/hooks';
import { ExerciseProgress } from '../components/ExerciseProgress';
import { SessionCard } from '../components/SessionCard';

function HistoryContent({ day, sessions }: { day: WorkoutDayDetail; sessions: WorkoutSession[] }): JSX.Element {
  const deleteMutation = useDeleteSession(day.id);
  const [toDelete, setToDelete] = useState<WorkoutSession | null>(null);
  const startAction = day.exercises.length > 0 && (
    <LinkButton to={activeWorkoutPath(day.id)} icon={Play} size="sm">Iniciar tabla</LinkButton>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={`Historial · ${day.name}`} description={day.routineName} backTo={`/routines/${day.routineId}?day=${day.id}`} backLabel="Volver a la rutina" actions={startAction} />

      {sessions.length === 0 ? (
        <EmptyState icon={History} title="Aún no hay entrenamientos registrados" description="Inicia esta tabla y guarda la sesión para empezar a ver tu progresión." action={startAction} />
      ) : (
        <>
          <ExerciseProgress sessions={sessions} />
          <section aria-labelledby="sessions-title" className="space-y-3">
            <h2 id="sessions-title" className="text-lg font-semibold text-slate-900">Sesiones ({sessions.length})</h2>
            <ol className="space-y-3">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} onDelete={() => setToDelete(session)} />
              ))}
            </ol>
          </section>
        </>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar sesión"
        message="Se eliminará este entrenamiento del historial. Esta acción no se puede deshacer."
        confirmLabel="Eliminar sesión"
        loading={deleteMutation.isPending}
        error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : null}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
        onCancel={() => {
          deleteMutation.reset();
          setToDelete(null);
        }}
      />
    </div>
  );
}

export function HistoryPage(): JSX.Element {
  const { dayId = '' } = useParams();
  const day = useDayQuery(dayId);
  const history = useDayHistoryQuery(dayId);
  useDocumentTitle(day.data ? `Historial: ${day.data.name}` : 'Historial');

  if (day.isPending || history.isPending) return <LoadingState label="Cargando historial…" />;
  if (day.isError) return <ErrorState message={getErrorMessage(day.error)} backTo="/" />;
  if (history.isError) return <ErrorState message={getErrorMessage(history.error)} onRetry={() => void history.refetch()} />;
  return <HistoryContent day={day.data} sessions={history.data} />;
}
