// Single source of truth for the API contract (PROJECT_DOC pending #1, resolved).
export { LIMITS } from './limits.js';
export { SET_TYPES, isSetType, type SetType } from './set-types.js';
export {
  EQUIPMENT,
  MUSCLE_GROUPS,
  catalogMatchRank,
  searchCatalog,
  isEquipment,
  isMuscleGroup,
  normalizeSearch,
  type Equipment,
  type MuscleGroup,
} from './catalog.js';

export * from './schemas/common.schema.js';
export * from './schemas/routine.schema.js';
export * from './schemas/workout-day.schema.js';
export * from './schemas/day-exercise.schema.js';
export * from './schemas/session.schema.js';
export * from './schemas/catalog.schema.js';
export * from './schemas/auth.schema.js';

export type * from './types/domain.types.js';
export type * from './types/api.types.js';
