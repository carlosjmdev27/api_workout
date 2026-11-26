import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { RoutineForm } from '../components/RoutineForm';
import { useCreateRoutine } from '../hooks';
import { EMPTY_ROUTINE } from '../routine-form';

export function RoutineCreatePage(): JSX.Element {
  useDocumentTitle('Nueva rutina');
  const createMutation = useCreateRoutine();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Nueva rutina" />
      <RoutineForm
        initialValues={EMPTY_ROUTINE}
        submitLabel="Crear rutina"
        cancelTo="/"
        pending={createMutation.isPending}
        error={createMutation.error}
        hint="Después podrás añadir sus tablas (Torso A, Pierna A…) y los ejercicios de cada una."
        onSubmit={(input) =>
          createMutation.mutate(input, {
            onSuccess: (routine) => navigate(`/routines/${routine.id}`, { replace: true }),
          })
        }
      />
    </>
  );
}
