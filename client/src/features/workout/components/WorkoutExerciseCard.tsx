import { useId, useState, type JSX } from 'react';
import { Minus, Plus } from 'lucide-react';
import { NotePanel, NoteToggleButton } from '../../../components/NoteToggle';
import { MuscleBadge } from '../../catalog/components/MuscleBadge';
import type { WorkoutGroup } from '../workout-model';
import type { WorkoutSessionState } from '../useWorkoutSession';
import { WorkoutSetRow } from './WorkoutSetRow';

interface WorkoutExerciseCardProps {
  group: WorkoutGroup;
  session: WorkoutSessionState;
}

const HEAD = 'py-1 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground';
const FOOT_BUTTON =
  'inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:text-muted-foreground/70';

export function WorkoutExerciseCard({ group, session }: WorkoutExerciseCardProps): JSX.Element {
  const { exercise, rows, canAddExtra } = group;
  const [notesOpen, setNotesOpen] = useState(false);
  const notesId = useId();
  const done = rows.filter((row) => session.entryOf(row.key).completed).length;
  const lastRow = rows.at(-1);
  // Only the last extra set can be removed (keeps numbering contiguous).
  const removable = lastRow?.isExtra === true && !session.entryOf(lastRow.key).completed ? lastRow : null;

  return (
    <li className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <h2 className="min-w-0 break-words font-semibold text-foreground">
            <span className="mr-1.5 text-primary">{exercise.order}.</span>
            {exercise.name}
          </h2>
          <MuscleBadge catalogExerciseId={exercise.catalogExerciseId} />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {exercise.notes && (
            <NoteToggleButton open={notesOpen} controls={notesId} label={`Notas de ${exercise.name}`} onToggle={() => setNotesOpen((prev) => !prev)} />
          )}
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            <span className="sr-only">Series hechas: </span>{done}/{rows.length}
          </span>
        </div>
      </div>
      {exercise.notes && <NotePanel id={notesId} open={notesOpen} text={exercise.notes} />}

      <table className="mt-1 w-full table-fixed text-sm">
        <caption className="sr-only">Series de {exercise.name}</caption>
        <colgroup>
          <col className="w-10" /><col className="w-13" /><col /><col className="w-16" /><col className="w-14" /><col className="w-10" />
        </colgroup>
        <thead>
          <tr className="border-b border-border/60">
            <th scope="col" className={`${HEAD} pl-1`}>Serie</th>
            <th scope="col" className={HEAD}>Tipo</th>
            <th scope="col" className={HEAD}>Anterior</th>
            <th scope="col" className={HEAD}>Peso (kg)</th>
            <th scope="col" className={HEAD}>Reps</th>
            <th scope="col" className={`${HEAD} text-center`}><span aria-hidden="true">✓</span><span className="sr-only">Hecha</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <WorkoutSetRow
              key={row.key}
              row={row}
              exerciseName={exercise.name}
              entry={session.entryOf(row.key)}
              errors={session.rowErrors[row.key]}
              onValue={(field, value) => session.setValue(row.key, field, value)}
              onToggle={() => session.toggle(row.key)}
            />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6} className="pt-0.5">
              <div className="flex items-center justify-between">
                <button type="button" disabled={!canAddExtra} onClick={() => session.addExtra(exercise.id)} aria-label={`Añadir serie extra a ${exercise.name}`} className={`${FOOT_BUTTON} text-primary hover:bg-primary/10`}>
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Añadir serie
                </button>
                {removable && (
                  <button type="button" onClick={() => session.removeExtra(exercise.id)} aria-label={`Quitar serie extra ${removable.setNumber} de ${exercise.name}`} className={`${FOOT_BUTTON} text-muted-foreground hover:bg-destructive/10 hover:text-destructive`}>
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    Quitar serie extra
                  </button>
                )}
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </li>
  );
}
