import type { JSX } from 'react';
import { Plus } from 'lucide-react';
import { LIMITS, SET_TYPES } from '@gym/shared';
import type { ExerciseEditor } from '../useExerciseEditor';
import { SET_TYPE_LABELS, SET_TYPE_SHORT } from '../set-type-styles';
import { SET_EDITOR_GRID, SetRowEditor } from './SetRowEditor';

const HEAD = 'text-[11px] font-medium uppercase tracking-wide text-slate-500';

/** Editable planned sets: one column header, dense rows and a "+ Añadir serie" footer row. */
export function SetRowsEditor({ editor }: { editor: ExerciseEditor }): JSX.Element {
  const { values, errors, canAddSet, canRemoveSet } = editor;

  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-slate-700">
        Series <span className="font-normal text-slate-500">({values.sets.length}/{LIMITS.SETS_PER_EXERCISE_MAX})</span>
      </legend>

      {/* Visual header only: every input has its own accessible name. */}
      <div className={`${SET_EDITOR_GRID} border-b border-slate-100 pb-1`} aria-hidden="true">
        <span className={`${HEAD} text-center`}>#</span>
        <span className={HEAD}>Tipo</span>
        <span className={`${HEAD} text-center`}>Kg</span>
        <span className={`${HEAD} text-center`}>Mín</span>
        <span className={`${HEAD} text-center`}>Máx</span>
        <span className={`${HEAD} text-center`}>RIR</span>
        <span />
      </div>

      <ol>
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

      <button
        type="button"
        onClick={editor.addSet}
        disabled={!canAddSet}
        title="La nueva serie copia la configuración de la última"
        className="mt-0.5 flex h-7 w-full items-center gap-1 rounded-md px-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Añadir serie <span className="font-normal text-slate-500">(copia la última)</span>
      </button>

      <p className="mt-1 text-[11px] leading-snug text-slate-500">
        {SET_TYPES.map((type) => `${SET_TYPE_SHORT[type]} ${SET_TYPE_LABELS[type].toLowerCase()}`).join(' · ')}
      </p>
    </fieldset>
  );
}
