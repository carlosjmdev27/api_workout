import type { JSX } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import { IconButton } from '../../../components/IconButton';
import { LIMITS } from '../../../utils/limits';
import type { DraftErrors, ExerciseDraft } from '../../routines/useRoutineDraft';
import type { ExerciseField } from '../exercise-form';
import { ExerciseFields } from './ExerciseFields';

interface ExerciseDraftListProps {
  drafts: ExerciseDraft[];
  errors: DraftErrors;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onChange: (key: string, field: ExerciseField, value: string) => void;
}

/** Editable list of exercises inside the "new routine" form. */
export function ExerciseDraftList({
  drafts,
  errors,
  onAdd,
  onRemove,
  onChange,
}: ExerciseDraftListProps): JSX.Element {
  const limitReached = drafts.length >= LIMITS.EXERCISES_PER_ROUTINE_MAX;

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-slate-900">Ejercicios</legend>

      {drafts.length === 0 && (
        <p className="text-sm text-slate-500">
          Opcional: puedes añadir los ejercicios ahora o más tarde desde la rutina.
        </p>
      )}

      <ol className="space-y-4">
        {drafts.map((draft, index) => (
          <li key={draft.key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Ejercicio {index + 1}</span>
              <IconButton
                icon={Trash2}
                tone="danger"
                label={`Quitar ejercicio ${index + 1}`}
                onClick={() => onRemove(draft.key)}
              />
            </div>
            <ExerciseFields
              values={draft.values}
              errors={errors[draft.key] ?? {}}
              onChange={(field, value) => onChange(draft.key, field, value)}
            />
          </li>
        ))}
      </ol>

      <Button variant="secondary" icon={Plus} onClick={onAdd} disabled={limitReached}>
        Añadir ejercicio
      </Button>
    </fieldset>
  );
}
