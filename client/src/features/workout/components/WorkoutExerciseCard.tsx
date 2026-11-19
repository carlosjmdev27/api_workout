import type { JSX } from 'react';
import type { WorkoutGroup } from '../workout-model';
import type { WorkoutSessionState } from '../useWorkoutSession';
import { WorkoutSetRow } from './WorkoutSetRow';

interface WorkoutExerciseCardProps {
  group: WorkoutGroup;
  session: WorkoutSessionState;
}

export function WorkoutExerciseCard({ group, session }: WorkoutExerciseCardProps): JSX.Element {
  const { exercise, rows } = group;
  const done = rows.filter((row) => session.entryOf(row.key).completed).length;

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words font-semibold text-slate-900">
            <span className="mr-2 text-indigo-600">{exercise.order}.</span>
            {exercise.name}
          </h2>
          {exercise.notes && <p className="mt-0.5 whitespace-pre-line text-sm text-slate-500">{exercise.notes}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">
          {done}/{rows.length}
        </span>
      </div>
      <ol className="space-y-2">
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
      </ol>
    </li>
  );
}
