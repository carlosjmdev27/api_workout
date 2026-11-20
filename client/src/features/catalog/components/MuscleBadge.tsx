import type { JSX } from 'react';
import { useCatalogById } from '../hooks';

/** Discreet "Pecho · Barra" badge for exercises linked to the catalog (nothing otherwise). */
export function MuscleBadge({ catalogExerciseId }: { catalogExerciseId: string | null }): JSX.Element | null {
  const byId = useCatalogById();
  const entry = catalogExerciseId ? byId.get(catalogExerciseId) : undefined;
  if (!entry) return null;
  return (
    <span className="inline-block shrink-0 whitespace-nowrap rounded-md bg-slate-100 px-1.5 py-px text-[11px] font-medium text-slate-700">
      {entry.muscleGroup}
      {entry.equipment && <span className="font-normal text-slate-500">&nbsp;·&nbsp;{entry.equipment}</span>}
    </span>
  );
}
