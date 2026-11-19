import type { JSX } from 'react';
import type { RoutineDetail } from '@gym/shared';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { ErrorState, LoadingState } from '../../../components/StatusViews';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { RoutineForm } from '../components/RoutineForm';
import { useRoutineQuery, useUpdateRoutine } from '../hooks';
import { routineToFormValues } from '../routine-form';

function EditContent({ routine }: { routine: RoutineDetail }): JSX.Element {
  const updateMutation = useUpdateRoutine(routine.id);
  const navigate = useNavigate();
  const detailPath = `/routines/${routine.id}`;

  return (
    <>
      <PageHeader title="Editar rutina" backTo={detailPath} backLabel={routine.name} />
      <RoutineForm
        initialValues={routineToFormValues(routine)}
        submitLabel="Guardar cambios"
        cancelTo={detailPath}
        pending={updateMutation.isPending}
        error={updateMutation.error}
        hint="Las tablas y sus ejercicios se gestionan desde la vista de la rutina."
        onSubmit={(input) => updateMutation.mutate(input, { onSuccess: () => navigate(detailPath) })}
      />
    </>
  );
}

export function RoutineEditPage(): JSX.Element {
  const { routineId = '' } = useParams();
  const { data, isPending, isError, error, refetch } = useRoutineQuery(routineId);
  useDocumentTitle('Editar rutina');

  if (isPending) return <LoadingState label="Cargando rutina…" />;
  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} backTo="/" />;
  }
  return <EditContent routine={data} />;
}
