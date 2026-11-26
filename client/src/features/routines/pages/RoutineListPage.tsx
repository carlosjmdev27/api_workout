import type { JSX } from 'react';
import { Dumbbell, Plus } from 'lucide-react';
import type { RoutineSummary } from '@gym/shared';
import { LinkButton } from '../../../components/LinkButton';
import { EmptyState, ErrorState, LoadingState } from '../../../components/StatusViews';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { AddWorkoutCard } from '../components/AddWorkoutCard';
import { RoutineCard } from '../components/RoutineCard';
import { useRoutinesQuery } from '../hooks';

const NEW_ROUTINE_PATH = '/routines/new';
const ROUTINES_TITLE = 'My Workouts';

/** First visit: only the empty-state card with a single "create" action (no title, no duplicates). */
function FirstRoutine(): JSX.Element {
  return (
    <>
      {/* Visually hidden: the page still needs a heading for screen readers. */}
      <h1 className="sr-only">{ROUTINES_TITLE}</h1>
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
    </>
  );
}

/**
 * The grid straight away (no visible title, Fase 18); the add card closes it.
 * auto-rows-fr keeps every card the same height.
 */
function RoutineGrid({ routines }: { routines: RoutineSummary[] }): JSX.Element {
  return (
    <>
      {/* Visually hidden: the page still needs a heading for screen readers. */}
      <h1 className="sr-only">{ROUTINES_TITLE}</h1>
      <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => (
          <li key={routine.id}>
            <RoutineCard routine={routine} />
          </li>
        ))}
        <li>
          <AddWorkoutCard to={NEW_ROUTINE_PATH} />
        </li>
      </ul>
    </>
  );
}

export function RoutineListPage(): JSX.Element {
  useDocumentTitle(ROUTINES_TITLE);
  const { data, isPending, isError, error, refetch } = useRoutinesQuery();

  // No title until the list is known: a new user never sees it appear and vanish.
  if (isPending) return <LoadingState label="Cargando rutinas…" />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  return data.length === 0 ? <FirstRoutine /> : <RoutineGrid routines={data} />;
}
