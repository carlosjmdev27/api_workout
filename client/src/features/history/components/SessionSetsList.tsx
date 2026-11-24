import type { JSX } from 'react';
import { Check } from 'lucide-react';
import type { LoggedSet } from '@gym/shared';
import { formatWeight } from '../../../utils/format';
import { useWeightUnit } from '../../auth/useWeightUnit';
import { SetTypeBadge } from '../../exercises/components/SetTypeBadge';

/** Logged sets grouped by exercise, in workout order. */
function groupByExercise(sets: LoggedSet[]): { key: string; name: string; sets: LoggedSet[] }[] {
  const groups = new Map<string, { key: string; name: string; sets: LoggedSet[] }>();
  sets.forEach((set) => {
    const key = `${set.exerciseOrder}#${set.exerciseName}`;
    const group = groups.get(key) ?? { key, name: set.exerciseName, sets: [] };
    group.sets.push(set);
    groups.set(key, group);
  });
  return [...groups.values()];
}

/** Every set of a session: type, weight × reps and whether it was completed. */
export function SessionSetsList({ sets }: { sets: LoggedSet[] }): JSX.Element {
  const unit = useWeightUnit();
  return (
    <div className="space-y-3">
      {groupByExercise(sets).map((group) => (
        <div key={group.key}>
          <h3 className="text-sm font-medium text-foreground">{group.name}</h3>
          <ul className="mt-1 space-y-1 text-sm">
            {group.sets.map((set) => (
              <li key={set.id} className="flex items-center gap-2 tabular-nums">
                <span className="w-5 text-muted-foreground">{set.setNumber}</span>
                <SetTypeBadge type={set.setType} />
                <span>{set.actualWeight === null ? 'sin peso' : formatWeight(set.actualWeight, unit)} × {set.actualReps ?? '—'}</span>
                {set.completed ? (
                  <Check className="h-4 w-4 text-primary" aria-label="completada" />
                ) : (
                  <span className="text-xs text-muted-foreground/70">no completada</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
