import { useState, type JSX } from 'react';
import { Flag, Play, Trash2 } from 'lucide-react';
import { LIMITS, type WorkoutDayDetail, type WorkoutSession } from '@gym/shared';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { TextAreaField } from '../../../components/FormField';
import { LinkButton } from '../../../components/LinkButton';
import { ErrorState, LoadingState } from '../../../components/StatusViews';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorDetails, getErrorMessage } from '../../../utils/errors';
import { activeWorkoutPath, clearActiveWorkout, useActiveWorkout } from '../active-workout';
import { FinishPendingDialog } from '../components/FinishPendingDialog';
import { WorkoutExerciseCard } from '../components/WorkoutExerciseCard';
import { WorkoutTopBar } from '../components/WorkoutTopBar';
import { useCreateSession, useDayHistoryQuery, useDayQuery } from '../hooks';
import { useWorkoutSession } from '../useWorkoutSession';

function ActiveWorkout({ day, lastSession }: { day: WorkoutDayDetail; lastSession: WorkoutSession | undefined }): JSX.Element {
  const session = useWorkoutSession(day, lastSession);
  const createMutation = useCreateSession(day.id);
  const [dialog, setDialog] = useState<'cancel' | 'pending' | null>(null);
  const navigate = useNavigate();

  const save = (includePending: boolean): void => {
    setDialog(null);
    const payload = session.buildPayload(includePending);
    if (!payload) return;
    createMutation.mutate(payload, {
      onSuccess: (saved) => {
        session.discard();
        navigate(`/sessions/${saved.id}`, { replace: true });
      },
    });
  };

  const finish = (): void => (session.pendingCount > 0 ? setDialog('pending') : save(false));

  const cancel = (): void => {
    session.discard();
    navigate(`/routines/${day.routineId}?day=${day.id}`, { replace: true });
  };

  return (
    <div className="pb-28">
      <WorkoutTopBar dayName={day.name} routineName={day.routineName} startedAt={session.startedAt} completed={session.completedCount} total={session.totalCount} onCancel={() => setDialog('cancel')} />

      <p className="mb-4 text-sm text-slate-500">
        {session.resumed ? 'Entrenamiento reanudado: el cronómetro sigue desde que empezaste. ' : ''}
        {lastSession ? 'La columna «Anterior» muestra lo que hiciste la última vez.' : 'Primera sesión de esta tabla.'}
      </p>

      <ol className="space-y-3">
        {session.groups.map((group) => <WorkoutExerciseCard key={group.exercise.id} group={group} session={session} />)}
      </ol>

      <div className="mt-6">
        <TextAreaField label="Notas del entrenamiento" rows={2} maxLength={LIMITS.NOTES_MAX} value={session.notes} placeholder="Sensaciones, molestias, cambios…" onChange={(event) => session.setNotes(event.target.value)} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-4xl space-y-2">
          {session.formError && <Alert message={session.formError} />}
          {createMutation.isError && <Alert message={getErrorMessage(createMutation.error)} details={getErrorDetails(createMutation.error)} />}
          <Button icon={Flag} className="w-full py-3 text-base" loading={createMutation.isPending} onClick={finish}>
            Terminar entrenamiento
          </Button>
        </div>
      </div>

      <FinishPendingDialog open={dialog === 'pending'} pendingCount={session.pendingCount} onSaveAll={() => save(true)} onSaveCompletedOnly={() => save(false)} onCancel={() => setDialog(null)} />
      <ConfirmDialog open={dialog === 'cancel'} title="Cancelar entrenamiento" message="Se descartarán el cronómetro y todas las series apuntadas en esta sesión. El historial guardado no se toca." confirmLabel="Descartar entrenamiento" onConfirm={cancel} onCancel={() => setDialog(null)} />
    </div>
  );
}

/** Another day is in progress: never overwrite it silently. */
function OtherWorkoutInProgress({ dayName, otherDayId }: { dayName: string; otherDayId: string }): JSX.Element {
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
      <p className="text-sm text-amber-900">Tienes un entrenamiento en curso de <strong>{dayName}</strong>. Solo puede haber uno activo a la vez.</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <LinkButton to={activeWorkoutPath(otherDayId)} icon={Play}>Reanudar {dayName}</LinkButton>
        <Button variant="secondary" icon={Trash2} onClick={clearActiveWorkout}>Descartarlo y empezar esta</Button>
      </div>
    </div>
  );
}

export function WorkoutPage(): JSX.Element {
  const { dayId = '' } = useParams();
  const day = useDayQuery(dayId);
  const history = useDayHistoryQuery(dayId);
  const active = useActiveWorkout();
  useDocumentTitle(day.data ? `Entrenando: ${day.data.name}` : 'Entrenamiento');

  if (day.isPending || history.isPending) return <LoadingState label="Preparando el entrenamiento…" />;
  if (day.isError) return <ErrorState message={getErrorMessage(day.error)} backTo="/" />;
  if (history.isError) return <ErrorState message={getErrorMessage(history.error)} onRetry={() => void history.refetch()} />;
  if (day.data.exercises.length === 0) {
    return <ErrorState message="Esta tabla todavía no tiene ejercicios. Añádelos antes de empezar a entrenar." backTo={`/routines/${day.data.routineId}?day=${day.data.id}`} />;
  }
  if (active && active.dayId !== dayId) return <OtherWorkoutInProgress dayName={active.dayName} otherDayId={active.dayId} />;
  return <ActiveWorkout key={dayId} day={day.data} lastSession={history.data[0]} />;
}
