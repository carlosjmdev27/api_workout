import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { useCatalogById } from '../hooks';

/** Discreet "Pecho · Barra" badge for exercises linked to the catalog (nothing otherwise). */
export function MuscleBadge({ catalogExerciseId }: { catalogExerciseId: string | null }): JSX.Element | null {
  const byId = useCatalogById();
  const entry = catalogExerciseId ? byId.get(catalogExerciseId) : undefined;
  if (!entry) return null;
  return (
    <Badge variant="secondary" className="inline-block h-auto rounded-md px-1.5 py-px text-[11px]">
      {entry.muscleGroup}
      {entry.equipment && <span className="font-normal text-muted-foreground">&nbsp;·&nbsp;{entry.equipment}</span>}
    </Badge>
  );
}
