import { useState, type JSX } from 'react';
import { ChevronLeft, ChevronRight, History, Pencil, Play, Trash2 } from 'lucide-react';
import type { WorkoutDay } from '@gym/shared';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { IconButton } from '../../../components/IconButton';
import { LinkButton } from '../../../components/LinkButton';
import { getErrorMessage } from '../../../utils/errors';
import { pluralize } from '../../../utils/format';
import { DayExercises } from '../../exercises/components/DayExercises';
import { activeWorkoutPath } from '../../workout/active-workout';
import { useDeleteDay, useRenameDay } from '../hooks';
import { DayNameDialog } from './DayNameDialog';
import { tabId } from '../tab-ids';

interface DayPanelProps {
  routineId: string;
  day: WorkoutDay;
  panelId: string;
  isFirst: boolean;
  isLast: boolean;
  moving: boolean;
  onMove: (offset: -1 | 1) => void;
  onDeleted: () => void;
}

/** Content of the selected table: its actions and its exercises. */
export function DayPanel({ routineId, day, panelId, isFirst, isLast, moving, onMove, onDeleted }: DayPanelProps): JSX.Element {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const renameMutation = useRenameDay(routineId);
  const deleteMutation = useDeleteDay(routineId);
  const setCount = day.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);

  const openRename = (): void => {
    renameMutation.reset();
    setRenameOpen(true);
  };

  const closeDelete = (): void => {
    deleteMutation.reset();
    setDeleteOpen(false);
  };

  return (
    <section role="tabpanel" id={panelId} aria-labelledby={tabId(day.id)} className="space-y-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-semibold text-slate-900">{day.name}</h2>
          <p className="text-sm text-slate-500">
            {pluralize(day.exercises.length, 'ejercicio', 'ejercicios')} · {pluralize(setCount, 'serie', 'series')}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {day.exercises.length > 0 && (
              <LinkButton to={activeWorkoutPath(day.id)} icon={Play} size="sm">Iniciar tabla</LinkButton>
            )}
            <LinkButton to={`/days/${day.id}/history`} icon={History} size="sm" variant="secondary">Historial</LinkButton>
          </div>
        </div>
        <div className="flex shrink-0">
          <IconButton icon={ChevronLeft} label="Mover tabla a la izquierda" onClick={() => onMove(-1)} disabled={isFirst || moving} />
          <IconButton icon={ChevronRight} label="Mover tabla a la derecha" onClick={() => onMove(1)} disabled={isLast || moving} />
          <IconButton icon={Pencil} label="Renombrar tabla" onClick={openRename} />
          <IconButton icon={Trash2} tone="danger" label="Eliminar tabla" onClick={() => setDeleteOpen(true)} />
        </div>
      </div>

      <DayExercises routineId={routineId} dayId={day.id} exercises={day.exercises} />

      <DayNameDialog
        open={renameOpen}
        title="Renombrar tabla"
        initialName={day.name}
        submitLabel="Guardar"
        pending={renameMutation.isPending}
        error={renameMutation.error}
        onSubmit={(input) =>
          renameMutation.mutate({ dayId: day.id, input }, { onSuccess: () => setRenameOpen(false) })
        }
        onClose={() => setRenameOpen(false)}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar tabla"
        message={`Se eliminará «${day.name}» con sus ejercicios y TODO su historial de entrenamientos. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar tabla"
        loading={deleteMutation.isPending}
        error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : null}
        onConfirm={() => deleteMutation.mutate(day.id, { onSuccess: onDeleted })}
        onCancel={closeDelete}
      />
    </section>
  );
}
