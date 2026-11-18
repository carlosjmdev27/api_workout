import type {
  CreateRoutineInput,
  Routine,
  RoutineSummary,
  RoutineWithExercises,
  UpdateRoutineInput,
} from '../types/routine.types.js';

/**
 * Persistence contract for routines. Async on purpose: the SQLite
 * implementation is synchronous, but a future PostgreSQL one will not.
 */
export interface RoutineRepository {
  findAll(): Promise<RoutineSummary[]>;
  findById(id: string): Promise<RoutineWithExercises | null>;
  exists(id: string): Promise<boolean>;
  /** Creates the routine and its exercises atomically. */
  create(input: CreateRoutineInput): Promise<RoutineWithExercises>;
  update(id: string, input: UpdateRoutineInput): Promise<Routine | null>;
  /** Deletes the routine and its exercises atomically. */
  delete(id: string): Promise<boolean>;
}
