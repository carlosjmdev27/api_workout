import { NotFoundError } from '../errors/app-error.js';
import type { RoutineRepository } from '../repositories/routine.repository.js';
import type {
  CreateRoutineInput,
  RoutineSummary,
  RoutineWithExercises,
  UpdateRoutineInput,
} from '../types/routine.types.js';

export function routineNotFound(id: string): NotFoundError {
  return new NotFoundError('ROUTINE_NOT_FOUND', `Routine ${id} not found`);
}

/** Business logic for routines. Knows nothing about HTTP or SQL. */
export class RoutineService {
  private readonly routines: RoutineRepository;

  constructor(routines: RoutineRepository) {
    this.routines = routines;
  }

  list(): Promise<RoutineSummary[]> {
    return this.routines.findAll();
  }

  async getById(id: string): Promise<RoutineWithExercises> {
    const routine = await this.routines.findById(id);
    if (!routine) throw routineNotFound(id);
    return routine;
  }

  create(input: CreateRoutineInput): Promise<RoutineWithExercises> {
    return this.routines.create(input);
  }

  async update(id: string, input: UpdateRoutineInput): Promise<RoutineWithExercises> {
    const updated = await this.routines.update(id, input);
    if (!updated) throw routineNotFound(id);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.routines.delete(id);
    if (!deleted) throw routineNotFound(id);
  }
}
