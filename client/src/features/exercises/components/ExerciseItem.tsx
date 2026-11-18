import type { JSX, ReactNode } from 'react';
import { ArrowDown, ArrowUp, Pencil, Repeat, Timer, Trash2, Weight, type LucideIcon } from 'lucide-react';
import { IconButton } from '../../../components/IconButton';
import type { Exercise } from '../../../types/exercise';
import { formatRest, formatWeight } from '../../../utils/format';

interface ExerciseItemProps {
  exercise: Exercise;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function Stat({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }): JSX.Element {
  return (
    <li className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      <Icon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
      {children}
    </li>
  );
}

export function ExerciseItem({
  exercise,
  isFirst,
  isLast,
  busy,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: ExerciseItemProps): JSX.Element {
  return (
    <li className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
        {exercise.order}
      </span>

      <div className="min-w-0 flex-1 space-y-2">
        <h3 className="break-words font-medium text-slate-900">{exercise.name}</h3>
        <ul className="flex flex-wrap gap-2" aria-label="Detalles del ejercicio">
          <Stat icon={Repeat}>
            {exercise.sets} × {exercise.reps}
          </Stat>
          {exercise.weight !== null && <Stat icon={Weight}>{formatWeight(exercise.weight)}</Stat>}
          {exercise.restSeconds !== null && (
            <Stat icon={Timer}>{formatRest(exercise.restSeconds)}</Stat>
          )}
        </ul>
        {exercise.notes && (
          <p className="whitespace-pre-line break-words text-sm text-slate-500">{exercise.notes}</p>
        )}
      </div>

      <div className="grid shrink-0 grid-cols-2 content-start sm:flex sm:items-start">
        <IconButton icon={ArrowUp} label="Subir" onClick={onMoveUp} disabled={isFirst || busy} />
        <IconButton icon={ArrowDown} label="Bajar" onClick={onMoveDown} disabled={isLast || busy} />
        <IconButton icon={Pencil} label={`Editar ${exercise.name}`} onClick={onEdit} />
        <IconButton icon={Trash2} label={`Eliminar ${exercise.name}`} tone="danger" onClick={onDelete} />
      </div>
    </li>
  );
}
