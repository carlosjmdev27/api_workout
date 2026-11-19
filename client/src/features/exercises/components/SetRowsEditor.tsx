import type { JSX } from 'react';
import { Plus } from 'lucide-react';
import { LIMITS } from '@gym/shared';
import { Button } from '../../../components/Button';
import type { ExerciseEditor } from '../useExerciseEditor';
import { SetRowEditor } from './SetRowEditor';

/** Editable list of planned sets: one row per set, plus "+ Añadir serie". */
export function SetRowsEditor({ editor }: { editor: ExerciseEditor }): JSX.Element {
  const { values, errors, canAddSet, canRemoveSet } = editor;

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-medium text-slate-700">
        Series <span className="font-normal text-slate-500">({values.sets.length}/{LIMITS.SETS_PER_EXERCISE_MAX})</span>
      </legend>

      <ol className="space-y-2">
        {values.sets.map((row, index) => (
          <SetRowEditor
            key={row.key}
            row={row}
            index={index}
            errors={errors}
            canDuplicate={canAddSet}
            canRemove={canRemoveSet}
            onTypeChange={(setType) => editor.updateSet(index, { setType })}
            onValueChange={(field, value) => editor.updateSet(index, { [field]: value })}
            onDuplicate={() => editor.duplicateSet(index)}
            onRemove={() => editor.removeSet(index)}
          />
        ))}
      </ol>

      {errors.sets && <p className="text-xs text-red-600">{errors.sets}</p>}

      <Button variant="secondary" size="sm" icon={Plus} onClick={editor.addSet} disabled={!canAddSet}>
        Añadir serie
      </Button>
      <p className="text-xs text-slate-500">La nueva serie copia la configuración de la última.</p>
    </fieldset>
  );
}
