import { BusinessRuleError, NotFoundError } from '../errors/app-error.js';

export const routineNotFound = (id: string): NotFoundError =>
  new NotFoundError('ROUTINE_NOT_FOUND', `Routine ${id} not found`);

export const dayNotFound = (id: string): NotFoundError =>
  new NotFoundError('DAY_NOT_FOUND', `Workout day ${id} not found`);

export const exerciseNotFound = (id: string): NotFoundError =>
  new NotFoundError('EXERCISE_NOT_FOUND', `Exercise ${id} not found`);

export const sessionNotFound = (id: string): NotFoundError =>
  new NotFoundError('SESSION_NOT_FOUND', `Session ${id} not found`);

export function limitReached(code: string, what: string, max: number): BusinessRuleError {
  return new BusinessRuleError(code, `Cannot have more than ${max} ${what}`);
}

/** A reorder request must list exactly the current items, each once. */
export function assertSameIds(current: readonly string[], ordered: readonly string[], code: string): void {
  const currentIds = new Set(current);
  const isSameSet = ordered.length === currentIds.size && ordered.every((id) => currentIds.has(id));
  if (!isSameSet) {
    throw new BusinessRuleError(code, 'The list must contain every current item exactly once');
  }
}
