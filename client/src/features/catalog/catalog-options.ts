import {
  MUSCLE_GROUPS,
  normalizeSearch,
  searchCatalog,
  type CatalogExercise,
  type MuscleGroup,
} from '@gym/shared';

export interface CatalogGroup {
  muscle: MuscleGroup;
  items: CatalogExercise[];
}

export type ComboOption = { kind: 'item'; item: CatalogExercise } | { kind: 'create'; name: string };

export interface CatalogOptions {
  /** Matches grouped by muscle group, in the canonical group order. */
  groups: CatalogGroup[];
  /** Flat list in display order (for keyboard navigation); "create" goes last. */
  options: ComboOption[];
  /** Catalog entry whose name equals the typed text (ignoring case/accents/spaces). */
  exact: CatalogExercise | null;
}

/** Filters (same word-based search as the API), groups and adds "+ Crear" when the name is new. */
export function buildCatalogOptions(
  items: readonly CatalogExercise[],
  query: string,
  muscle: MuscleGroup | null,
): CatalogOptions {
  const pool = muscle ? items.filter((item) => item.muscleGroup === muscle) : items;
  const matches = searchCatalog(pool, query);
  const groups = MUSCLE_GROUPS.map((group) => ({
    muscle: group,
    items: matches.filter((item) => item.muscleGroup === group),
  })).filter((group) => group.items.length > 0);

  const typed = query.trim();
  const exact = typed === '' ? null : (items.find((item) => normalizeSearch(item.name) === normalizeSearch(typed)) ?? null);
  const options: ComboOption[] = groups.flatMap((group) => group.items.map((item) => ({ kind: 'item' as const, item })));
  if (typed !== '' && !exact) options.push({ kind: 'create', name: typed });

  return { groups, options, exact };
}
