import type { JSX, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import type { WorkoutDay } from '@gym/shared';
import { Button } from '../../../components/Button';
import { tabId } from '../tab-ids';

interface DayTabsProps {
  days: WorkoutDay[];
  selectedId: string;
  panelId: string;
  canAdd: boolean;
  onSelect: (dayId: string) => void;
  onAdd: () => void;
}

/** Accessible tab bar (WAI-ARIA tabs): ←/→/Home/End move between tables. */
export function DayTabs({ days, selectedId, panelId, canAdd, onSelect, onAdd }: DayTabsProps): JSX.Element {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const keys: Record<string, number> = {
      ArrowRight: (index + 1) % days.length,
      ArrowLeft: (index - 1 + days.length) % days.length,
      Home: 0,
      End: days.length - 1,
    };
    const next = days[keys[event.key] ?? -1];
    if (!next) return;
    event.preventDefault();
    onSelect(next.id);
    document.getElementById(tabId(next.id))?.focus();
  };

  return (
    <div className="flex items-end gap-2 border-b border-slate-200">
      <div role="tablist" aria-label="Tablas de la rutina" className="-mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {days.map((day, index) => {
          const selected = day.id === selectedId;
          return (
            <button
              key={day.id}
              id={tabId(day.id)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(day.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                selected
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {day.name}
              <span className="ml-1.5 text-xs text-slate-400">{day.exercises.length}</span>
            </button>
          );
        })}
      </div>
      <div className="pb-1.5">
        <Button size="sm" variant="ghost" icon={Plus} onClick={onAdd} disabled={!canAdd}>
          Tabla
        </Button>
      </div>
    </div>
  );
}
