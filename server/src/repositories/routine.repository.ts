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
  findAll(): Promise<RoutineSummary[]>;
  /** Routine with its full tree: days -> exercises -> planned sets. */
  findById(id: string): Promise<RoutineDetail | null>;
  exists(id: string): Promise<boolean>;
  create(input: RoutineInput): Promise<RoutineDetail>;
  update(id: string, input: RoutineUpdate): Promise<Routine | null>;
  /** Deletes the routine and everything below it (days, exercises, sets, history). */
  delete(id: string): Promise<boolean>;
}
