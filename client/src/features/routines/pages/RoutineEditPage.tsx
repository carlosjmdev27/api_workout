import type { JSX } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { ErrorState, LoadingState } from '../../../components/StatusViews';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { RoutineEditForm } from '../components/RoutineEditForm';
import { useRoutineQuery } from '../hooks';

export function RoutineEditPage(): JSX.Element {
  const { routineId = '' } = useParams();
  const { data, isPending, isError, error, refetch } = useRoutineQuery(routineId);
  useDocumentTitle('Editar rutina');

  if (isPending) return <LoadingState label="Cargando rutina…" />;
  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} backTo="/" />;
  }

  return (
    <>
      <PageHeader title="Editar rutina" backTo={`/routines/${data.id}`} backLabel={data.name} />
      <RoutineEditForm routine={data} />
    </>
  );
}
