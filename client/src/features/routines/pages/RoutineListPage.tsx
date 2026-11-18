import type { JSX } from 'react';
import { Dumbbell, Plus } from 'lucide-react';
import { LinkButton } from '../../../components/LinkButton';
import { PageHeader } from '../../../components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../../../components/StatusViews';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { RoutineCard } from '../components/RoutineCard';
import { useRoutinesQuery } from '../hooks';

const NEW_ROUTINE_PATH = '/routines/new';

function RoutineListContent(): JSX.Element {
  const { data, isPending, isError, error, refetch } = useRoutinesQuery();

  if (isPending) return <LoadingState label="Cargando rutinas…" />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Aún no tienes rutinas"
        description="Crea tu primera rutina de entrenamiento y añade sus ejercicios."
        action={
          <LinkButton to={NEW_ROUTINE_PATH} icon={Plus}>
            Crear rutina
          </LinkButton>
        }
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((routine) => (
        <li key={routine.id}>
          <RoutineCard routine={routine} />
        </li>
      ))}
    </ul>
  );
}

export function RoutineListPage(): JSX.Element {
  useDocumentTitle('Mis rutinas');
  return (
    <>
      <PageHeader
        title="Mis rutinas"
        actions={
          <LinkButton to={NEW_ROUTINE_PATH} icon={Plus}>
            Nueva rutina
          </LinkButton>
        }
      />
      <RoutineListContent />
    </>
  );
}
