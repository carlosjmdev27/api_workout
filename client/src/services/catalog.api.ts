import type { CatalogExercise, CatalogExerciseInput } from '@gym/shared';
import { request } from './http-client';

export const catalogApi = {
  /** Whole catalog: the combobox filters locally (instant, tolerant to bad gym wifi). */
  list: (): Promise<CatalogExercise[]> => request('GET', '/exercises/catalog'),

  create: (input: CatalogExerciseInput): Promise<CatalogExercise> =>
    request('POST', '/exercises/catalog', input),
};
