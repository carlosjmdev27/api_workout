import type { JSX, MouseEvent } from 'react';
import { Plus } from 'lucide-react';
import { MUSCLE_GROUPS, type MuscleGroup } from '@gym/shared';
import type { CatalogOptions, ComboOption } from '../catalog-options';

interface CatalogListboxProps {
  id: string;
  model: CatalogOptions;
  active: number;
  muscle: MuscleGroup | null;
  status: 'loading' | 'error' | 'ready';
  optionId: (index: number) => string;
  onMuscle: (muscle: MuscleGroup | null) => void;
  onChoose: (option: ComboOption) => void;
}

/** Keeps focus in the input while clicking inside the popup. */
const keepFocus = (event: MouseEvent): void => event.preventDefault();

function Chip({ label, pressed, onClick }: { label: string; pressed: boolean; onClick: () => void }): JSX.Element {
  return (
    <button type="button" aria-pressed={pressed} onMouseDown={keepFocus} onClick={onClick}
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${pressed ? 'bg-primary text-primary-foreground ring-primary' : 'bg-card text-muted-foreground ring-border hover:bg-muted/50'}`}>
      {label}
    </button>
  );
}

/** Popup of the exercise combobox: muscle-group filter + suggestions grouped by muscle. */
export function CatalogListbox({ id, model, active, muscle, status, optionId, onMuscle, onChoose }: CatalogListboxProps): JSX.Element {
  let index = -1; // Running index across groups = position in model.options.
  const optionClass = (selected: boolean): string =>
    `flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm ${selected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'}`;
  const create = model.options.at(-1)?.kind === 'create' ? model.options.at(-1) : undefined;

  return (
    <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex gap-1.5 overflow-x-auto border-b border-border/60 p-2" aria-label="Filtrar por grupo muscular">
        <Chip label="Todos" pressed={muscle === null} onClick={() => onMuscle(null)} />
        {MUSCLE_GROUPS.map((group) => <Chip key={group} label={group} pressed={muscle === group} onClick={() => onMuscle(group)} />)}
      </div>
      <div id={id} role="listbox" aria-label="Ejercicios del catálogo" className="max-h-64 overflow-y-auto py-1" onMouseDown={keepFocus}>
        {status === 'loading' && <p className="px-3 py-2 text-sm text-muted-foreground">Cargando catálogo…</p>}
        {status === 'error' && <p className="px-3 py-2 text-sm text-muted-foreground">No se pudo cargar el catálogo; puedes escribir el nombre igualmente.</p>}
        {status === 'ready' && model.options.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">Escribe para buscar o crear un ejercicio.</p>}
        {model.groups.map((group) => (
          <div key={group.muscle} role="group" aria-label={group.muscle}>
            <div role="presentation" className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">{group.muscle}</div>
            {group.items.map((item) => {
              index += 1;
              const position = index;
              return (
                <div key={item.id} id={optionId(position)} role="option" aria-selected={active === position} className={optionClass(active === position)} onClick={() => onChoose({ kind: 'item', item })}>
                  <span className="truncate">{item.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.isCustom && <span className="mr-1.5 rounded bg-primary/10 px-1 text-primary">Propio</span>}
                    {item.equipment ?? ''}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
        {create?.kind === 'create' && (
          <div id={optionId(model.options.length - 1)} role="option" aria-selected={active === model.options.length - 1}
            className={`${optionClass(active === model.options.length - 1)} border-t border-border/60 font-medium text-primary`} onClick={() => onChoose(create)}>
            <span className="flex items-center gap-1.5 truncate"><Plus className="h-4 w-4 shrink-0" aria-hidden="true" />Crear y añadir «{create.name}»</span>
          </div>
        )}
      </div>
    </div>
  );
}
