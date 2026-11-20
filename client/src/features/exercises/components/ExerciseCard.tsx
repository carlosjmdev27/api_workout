import { useId, useState, type JSX } from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { LIMITS, type DayExercise } from '@gym/shared';
import { ActionMenu } from '../../../components/ActionMenu';
import { NotePanel, NoteToggleButton } from '../../../components/NoteToggle';
import { MuscleBadge } from '../../catalog/components/MuscleBadge';
import { SetsTable } from './SetsTable';

interface ExerciseCardProps {
  exercise: DayExercise;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSet: () => void;
}

/** Compact exercise of a table: one-line header, collapsed notes, dense set rows. */
export function ExerciseCard({
  exercise,
  isFirst,
  isLast,
  busy,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onAddSet,
}: ExerciseCardProps): JSX.Element {
  const [notesOpen, setNotesOpen] = useState(false);
  const notesId = useId();
  const { name } = exercise;

  return (
    <li className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <h3 className="min-w-0 break-words font-medium text-slate-900">
            <span className="mr-1.5 text-sm font-semibold text-indigo-600">{exercise.order}.</span>
            {name}
          </h3>
          <MuscleBadge catalogExerciseId={exercise.catalogExerciseId} />
        </div>
        <div className="flex shrink-0 items-center">
          {exercise.notes && (
            <NoteToggleButton open={notesOpen} controls={notesId} label={`Notas de ${name}`} onToggle={() => setNotesOpen((prev) => !prev)} />
          )}
          <ActionMenu
            label={`Acciones de ${name}`}
            actions={[
              { label: 'Editar', icon: Pencil, onSelect: onEdit },
              { label: 'Subir', icon: ArrowUp, onSelect: onMoveUp, disabled: isFirst || busy },
              { label: 'Bajar', icon: ArrowDown, onSelect: onMoveDown, disabled: isLast || busy },
              { label: 'Eliminar', icon: Trash2, onSelect: onDelete, tone: 'danger' },
            ]}
          />
        </div>
      </div>
      {exercise.notes && <NotePanel id={notesId} open={notesOpen} text={exercise.notes} />}
      <div className="mt-1">
        <SetsTable
          sets={exercise.sets}
          addLabel={`Añadir serie a ${name}`}
          addDisabled={busy || exercise.sets.length >= LIMITS.SETS_PER_EXERCISE_MAX}
          onAddSet={onAddSet}
        />
      </div>
    </li>
  );
}
