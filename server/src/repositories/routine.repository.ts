import type {
  Routine,
  RoutineDetail,
  RoutineInput,
  RoutineSummary,
  RoutineUpdate,
} from '@gym/shared';

/**
 * Persistence contract for routines. Async on purpose: the SQLite
 * implementation is synchronous, but a future PostgreSQL one will not.
 */
export interface RoutineRepository {
  /** Only the routines of this user. */
  findAll(userId: string): Promise<RoutineSummary[]>;
  /** Routine with its full tree: days -> exercises -> planned sets (ownership checked by the service). */
  findById(id: string): Promise<RoutineDetail | null>;
  create(userId: string, input: RoutineInput): Promise<RoutineDetail>;
  update(id: string, input: RoutineUpdate): Promise<Routine | null>;
  /** Deletes the routine and everything below it (days, exercises, sets, history). */
  delete(id: string): Promise<boolean>;
}
