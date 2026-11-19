import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CatalogExercise, CatalogExerciseInput } from '@gym/shared';
import { catalogApi } from '../../services/catalog.api';

export const catalogKeys = { all: ['catalog'] as const };

/** The catalog changes rarely: keep it cached for the whole visit. */
export function useCatalogQuery() {
  return useQuery({ queryKey: catalogKeys.all, queryFn: catalogApi.list, staleTime: 10 * 60_000 });
}

/** id -> catalog entry, to show muscle group/equipment next to linked exercises. */
export function useCatalogById(): ReadonlyMap<string, CatalogExercise> {
  const { data } = useCatalogQuery();
  return useMemo(() => new Map((data ?? []).map((entry) => [entry.id, entry])), [data]);
}

export function useCreateCatalogExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CatalogExerciseInput) => catalogApi.create(input),
    onSuccess: (created) => {
      queryClient.setQueryData<CatalogExercise[]>(catalogKeys.all, (current) => (current ? [...current, created] : current));
      void queryClient.invalidateQueries({ queryKey: catalogKeys.all });
    },
  });
}
