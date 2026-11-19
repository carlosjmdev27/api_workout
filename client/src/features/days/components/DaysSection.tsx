import { useId, useState, type JSX } from 'react';
import { CalendarRange, Plus } from 'lucide-react';
import { LIMITS, type RoutineDetail, type WorkoutDayInput } from '@gym/shared';
import { useSearchParams } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/StatusViews';
import { getErrorMessage } from '../../../utils/errors';
import { useCreateDay, useReorderDays } from '../hooks';
import { DayNameDialog } from './DayNameDialog';
import { DayPanel } from './DayPanel';
import { DayTabs } from './DayTabs';

const DAY_PARAM = 'day';

/** Tables of a routine as tabs. The selected tab lives in the URL (?day=…). */
export function DaysSection({ routine }: { routine: RoutineDetail }): JSX.Element {
  const [params, setParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const createMutation = useCreateDay(routine.id);
  const reorderMutation = useReorderDays(routine.id);
  const panelId = useId();

  const { days } = routine;
  const selected = days.find((day) => day.id === params.get(DAY_PARAM)) ?? days[0];
  const canAdd = days.length < LIMITS.DAYS_PER_ROUTINE_MAX;

  const select = (dayId: string | null): void => {
    setParams(dayId ? { [DAY_PARAM]: dayId } : {}, { replace: true });
  };

  const openCreate = (): void => {
    createMutation.reset();
    setCreateOpen(true);
  };

  const handleCreate = (input: WorkoutDayInput): void => {
    createMutation.mutate(input, {
      onSuccess: (day) => {
        setCreateOpen(false);
        select(day.id);
      },
    });
  };

  const handleMove = (offset: -1 | 1): void => {
    if (!selected) return;
    const ids = days.map((day) => day.id);
    const index = ids.indexOf(selected.id);
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    reorderMutation.mutate(ids);
  };

  return (
    <section aria-label="Tablas" className="space-y-2">
      {reorderMutation.isError && <Alert message={getErrorMessage(reorderMutation.error)} />}

      {selected ? (
        <>
          <DayTabs days={days} selectedId={selected.id} panelId={panelId} canAdd={canAdd} onSelect={select} onAdd={openCreate} />
          <DayPanel
            key={selected.id}
            routineId={routine.id}
            day={selected}
            panelId={panelId}
            isFirst={selected.order === 1}
            isLast={selected.order === days.length}
            moving={reorderMutation.isPending}
            onMove={handleMove}
            onDeleted={() => select(null)}
          />
        </>
      ) : (
        <EmptyState
          icon={CalendarRange}
          title="Esta rutina aún no tiene tablas"
          description="Crea una tabla por cada día de entrenamiento (p. ej. Torso A, Pierna A) y añade sus ejercicios."
          action={<Button icon={Plus} onClick={openCreate}>Crear primera tabla</Button>}
        />
      )}

      <DayNameDialog
        open={createOpen}
        title="Nueva tabla"
        initialName=""
        submitLabel="Crear tabla"
        pending={createMutation.isPending}
        error={createMutation.error}
        onSubmit={handleCreate}
        onClose={() => setCreateOpen(false)}
      />
    </section>
  );
}
