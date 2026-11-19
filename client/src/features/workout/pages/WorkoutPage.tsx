import { useState, type JSX } from 'react';
import { Save, Undo2 } from 'lucide-react';
import { LIMITS, type WorkoutDayDetail, type WorkoutSession } from '@gym/shared';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { TextAreaField } from '../../../components/FormField';
import { PageHeader } from '../../../components/PageHeader';
import { ErrorState, LoadingState } from '../../../components/StatusViews';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorDetails, getErrorMessage } from '../../../utils/errors';
import { ElapsedTimer } from '../components/ElapsedTimer';
import { WorkoutExerciseCard } from '../components/WorkoutExerciseCard';
import { useCreateSession, useDayHistoryQuery, useDayQuery } from '../hooks';
import { useWorkoutSession } from '../useWorkoutSession';

interface ActiveWorkoutProps {
  day: WorkoutDayDetail;
  lastSession: WorkoutSession | undefined;
}

function ActiveWorkout({ day, lastSession }: ActiveWorkoutProps): JSX.Element {
  const session = useWorkoutSession(day, lastSession);
  const createMutation = useCreateSession(day.id);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const navigate = useNavigate();
  const routinePath = `/routines/${day.routineId}?day=${day.id}`;

  const handleSave = (): void => {
    const payload = session.buildPayload();
    if (!payload) return;
    createMutation.mutate(payload, {
      onSuccess: () => {
        session.clearDraft();
        navigate(`/days/${day.id}/history`, { replace: true, state: { saved: true } });
      },
    });
  };

  return (
    <div className="pb-28">
      <PageHeader title={day.name} description={day.routineName} backTo={routinePath} backLabel="Volver a la rutina">
        <div className="flex flex-wrap gap-x-4 pt-1 text-sm text-slate-500">
          <ElapsedTimer startedAt={session.startedAt} />
          <span>{lastSession ? 'Comparando con tu última sesión' : 'Primera sesión de esta tabla'}</span>
        </div>
      </PageHeader>

      {session.wasRestored && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Se ha recuperado un entrenamiento sin guardar de esta tabla.
        </div>
      )}

      <ol className="space-y-4">
        {session.groups.map((group) => (
          <WorkoutExerciseCard key={group.exercise.id} group={group} session={session} />
        ))}
      </ol>

      <div className="mt-6">
        <TextAreaField label="Notas de la sesión" rows={2} maxLength={LIMITS.NOTES_MAX} value={session.notes} placeholder="Sensaciones, molestias, cambios…" onChange={(event) => session.setNotes(event.target.value)} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-4xl space-y-2">
          {session.formError && <Alert message={session.formError} />}
          {createMutation.isError && <Alert message={getErrorMessage(createMutation.error)} details={getErrorDetails(createMutation.error)} />}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600 tabular-nums">
              <strong className="text-slate-900">{session.completedCount}</strong>/{session.totalCount} series
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" icon={Undo2} disabled={!session.hasProgress || createMutation.isPending} onClick={() => setConfirmDiscard(true)}>
                Descartar
              </Button>
              <Button icon={Save} loading={createMutation.isPending} onClick={handleSave}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Descartar entrenamiento"
        message="Se borrarán las series marcadas y los valores escritos en esta sesión. No afecta al historial guardado."
        confirmLabel="Descartar"
        onConfirm={() => {
          session.discard();
          setConfirmDiscard(false);
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  );
}

export function WorkoutPage(): JSX.Element {
  const { dayId = '' } = useParams();
  const day = useDayQuery(dayId);
  const history = useDayHistoryQuery(dayId);
  useDocumentTitle(day.data ? `Entrenando: ${day.data.name}` : 'Entrenamiento');

  if (day.isPending || history.isPending) return <LoadingState label="Preparando el entrenamiento…" />;
  if (day.isError) return <ErrorState message={getErrorMessage(day.error)} backTo="/" />;
  if (history.isError) return <ErrorState message={getErrorMessage(history.error)} onRetry={() => void history.refetch()} />;
  if (day.data.exercises.length === 0) {
    return (
      <ErrorState
        message="Esta tabla todavía no tiene ejercicios. Añádelos antes de empezar a entrenar."
        backTo={`/routines/${day.data.routineId}?day=${day.data.id}`}
      />
    );
  }

  return <ActiveWorkout day={day.data} lastSession={history.data[0]} />;
}
