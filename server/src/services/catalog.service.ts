import {
  normalizeSearch,
  searchCatalog,
  type CatalogExercise,
  type CatalogExerciseInput,
  type CatalogQuery,
} from '@gym/shared';
import { BusinessRuleError, ConflictError } from '../errors/app-error.js';
import type { CatalogRepository } from '../repositories/catalog.repository.js';

/** Business logic of the exercise catalog: base list shared by everyone + custom exercises per user. */
export class CatalogService {
  private readonly catalog: CatalogRepository;

  constructor(catalog: CatalogRepository) {
    this.catalog = catalog;
  }

  /** Word-based, accent/case-insensitive search (same algorithm as the client). */
  async search(userId: string, query: CatalogQuery): Promise<CatalogExercise[]> {
    const items = await this.catalog.list(userId, query.muscle);
    return searchCatalog(items, query.q ?? '');
  }

  async createCustom(userId: string, input: CatalogExerciseInput): Promise<CatalogExercise> {
    const created = await this.catalog.createCustom(userId, input, normalizeSearch(input.name));
    if (!created) {
      throw new ConflictError('CATALOG_EXERCISE_EXISTS', `"${input.name}" already exists in the catalog`);
    }
    return created;
  }

  /** Used when linking a day exercise: the entry must exist and be visible to this user. */
  async assertVisible(userId: string, id: string): Promise<void> {
    if (!(await this.catalog.findVisible(userId, id))) {
      throw new BusinessRuleError('INVALID_CATALOG_EXERCISE', `Catalog exercise ${id} does not exist`);
    }
  }
}
