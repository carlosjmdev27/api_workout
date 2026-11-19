import { useState, type JSX } from 'react';
import { CalendarClock, ListChecks, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { LinkButton } from '../../../components/LinkButton';
import { PageHeader } from '../../../components/PageHeader';
import type { RoutineDetail } from '@gym/shared';
import { getErrorMessage } from '../../../utils/errors';
import { formatDate, pluralize } from '../../../utils/format';
import { useDeleteRoutine } from '../hooks';

/** Title, metadata and Edit / Delete actions of a routine. */
export function RoutineDetailHeader({ routine }: { routine: RoutineDetail }): JSX.Element {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteRoutine();
  const navigate = useNavigate();

  const handleDelete = (): void => {
    deleteMutation.mutate(routine.id, {
      onSuccess: () => navigate('/', { replace: true }),
    });
  };

  const closeConfirm = (): void => {
    deleteMutation.reset();
    setConfirmOpen(false);
  };

  return (
    <>
      <PageHeader
        title={routine.name}
        description={routine.description}
        backTo="/"
        backLabel="Mis rutinas"
        actions={
          <>
            <LinkButton to={`/routines/${routine.id}/edit`} variant="secondary" size="sm" icon={Pencil}>
              Editar
            </LinkButton>
            <Button variant="secondary" size="sm" icon={Trash2} onClick={() => setConfirmOpen(true)}>
              Eliminar
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            {pluralize(routine.days.length, 'tabla', 'tablas')}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Actualizada el {formatDate(routine.updatedAt)}
          </span>
        </div>
      </PageHeader>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar rutina"
        message={`Se eliminará «${routine.name}» con todas sus tablas, ejercicios e historial de entrenamientos. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar rutina"
        loading={deleteMutation.isPending}
        error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : null}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />
    </>
  );
}
