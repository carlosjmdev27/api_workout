import type { JSX } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../../components/StatusViews';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { DaysSection } from '../../days/components/DaysSection';
import { RoutineDetailHeader } from '../components/RoutineDetailHeader';
import { useRoutineQuery } from '../hooks';

export function RoutineDetailPage(): JSX.Element {
  const { routineId = '' } = useParams();
  const { data, isPending, isError, error, refetch } = useRoutineQuery(routineId);
  useDocumentTitle(data?.name ?? 'Rutina');

  if (isPending) return <LoadingState label="Cargando rutina…" />;
  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} backTo="/" />;
  }

  return (
    <div className="space-y-2">
      <RoutineDetailHeader routine={data} />
      <DaysSection routine={data} />
    </div>
  );
}
