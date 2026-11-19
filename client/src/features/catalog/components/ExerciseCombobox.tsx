import { useId, useState, type JSX, type KeyboardEvent } from 'react';
import { BookOpen } from 'lucide-react';
import { LIMITS, type CatalogExercise, type MuscleGroup } from '@gym/shared';
import { buildCatalogOptions, type ComboOption } from '../catalog-options';
import { useCatalogById, useCatalogQuery } from '../hooks';
import { CatalogListbox } from './CatalogListbox';
import { QuickCreateExercise } from './QuickCreateExercise';

interface ExerciseComboboxProps {
  value: string;
  linkedId: string | null;
  error?: string | undefined;
  /** Free typing (unlinks the catalog). */
  onType: (text: string) => void;
  /** Catalog entry chosen (or just created). */
  onPick: (exercise: CatalogExercise) => void;
}

/** Exercise name input with catalog autocomplete (WAI-ARIA combobox + listbox). */
export function ExerciseCombobox({ value, linkedId, error, onType, onPick }: ExerciseComboboxProps): JSX.Element {
  const catalog = useCatalogQuery();
  const byId = useCatalogById();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const inputId = useId();
  const listboxId = useId();
  const optionId = (index: number): string => `${listboxId}-opt-${index}`;
  const model = buildCatalogOptions(catalog.data ?? [], value, muscle);
  const linked = linkedId ? byId.get(linkedId) : undefined;

  const choose = (option: ComboOption): void => {
    setOpen(false);
    setActive(-1);
    if (option.kind === 'item') onPick(option.item);
    else setCreating(option.name);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const last = model.options.length - 1;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive((prev) => (event.key === 'ArrowDown' ? Math.min(prev + 1, last) : Math.max(prev - 1, 0)));
    } else if (event.key === 'Enter' && open && active >= 0) {
      event.preventDefault(); // Choose the option instead of submitting the editor form.
      const option = model.options[active];
      if (option) choose(option);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault(); // Close only the popup, not the dialog.
      setOpen(false);
    }
  };

  const handleBlur = (): void => {
    setOpen(false);
    // Typed an existing name without picking it: link it anyway.
    if (!linkedId && model.exact) onPick(model.exact);
  };

  return (
    <div className="relative space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        Ejercicio<span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
      </label>
      <input
        id={inputId} role="combobox" aria-expanded={open} aria-controls={listboxId} aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${inputId}-error` : undefined}
        autoComplete="off" required maxLength={LIMITS.NAME_MAX} value={value} placeholder="Busca: press banca, sentadilla…"
        onChange={(event) => { onType(event.target.value); setCreating(null); setOpen(true); setActive(-1); }}
        onClick={() => setOpen(true)} onKeyDown={handleKeyDown} onBlur={handleBlur}
        className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:outline-2 ${error ? 'border-red-400 focus:outline-red-500' : 'border-slate-300 focus:outline-indigo-600'}`}
      />
      {open && (
        <CatalogListbox id={listboxId} model={model} active={active} muscle={muscle} optionId={optionId}
          status={catalog.isPending ? 'loading' : catalog.isError ? 'error' : 'ready'}
          onMuscle={(next) => { setMuscle(next); setActive(-1); }} onChoose={choose} />
      )}
      {linked && !creating && (
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Del catálogo · {linked.muscleGroup}{linked.equipment ? ` · ${linked.equipment}` : ''}
        </p>
      )}
      {error && <p id={`${inputId}-error`} className="text-xs text-red-600">{error}</p>}
      {creating && (
        <QuickCreateExercise name={creating}
          onCreated={(exercise) => { setCreating(null); onPick(exercise); }} onCancel={() => setCreating(null)} />
      )}
    </div>
  );
}
