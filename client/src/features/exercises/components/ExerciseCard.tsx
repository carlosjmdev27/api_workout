import type { JSX } from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import type { DayExercise } from '@gym/shared';
import { IconButton } from '../../../components/IconButton';
import { useCatalogById } from '../../catalog/hooks';
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
}

export function ExerciseCard({
  exercise,
  isFirst,
  isLast,
  busy,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: ExerciseCardProps): JSX.Element {
  const catalogById = useCatalogById();
  const catalogEntry = exercise.catalogExerciseId ? catalogById.get(exercise.catalogExerciseId) : undefined;

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
          {exercise.order}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-medium text-slate-900">{exercise.name}</h3>
          {catalogEntry && (
            <p className="text-xs text-slate-500">
              {catalogEntry.muscleGroup}{catalogEntry.equipment ? ` · ${catalogEntry.equipment}` : ''}
            </p>
          )}
          {exercise.notes && (
            <p className="mt-0.5 whitespace-pre-line break-words text-sm text-slate-500">{exercise.notes}</p>
          )}
        </div>
        <div className="grid shrink-0 grid-cols-2 content-start sm:flex sm:items-start">
          <IconButton icon={ArrowUp} label={`Subir ${exercise.name}`} onClick={onMoveUp} disabled={isFirst || busy} />
          <IconButton icon={ArrowDown} label={`Bajar ${exercise.name}`} onClick={onMoveDown} disabled={isLast || busy} />
          <IconButton icon={Pencil} label={`Editar ${exercise.name}`} onClick={onEdit} />
          <IconButton icon={Trash2} label={`Eliminar ${exercise.name}`} tone="danger" onClick={onDelete} />
        </div>
      </div>
      <div className="mt-3">
        <SetsTable sets={exercise.sets} />
      </div>
    </li>
  );
}
