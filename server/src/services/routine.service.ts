import type { RoutineDetail, RoutineInput, RoutineSummary, RoutineUpdate } from '@gym/shared';
import type { RoutineRepository } from '../repositories/routine.repository.js';
import { routineNotFound } from './errors.js';

/** Business logic for routines. Knows nothing about HTTP or SQL. */
export class RoutineService {
  private readonly routines: RoutineRepository;

  constructor(routines: RoutineRepository) {
    this.routines = routines;
  }

  list(): Promise<RoutineSummary[]> {
    return this.routines.findAll();
  }

  async getById(id: string): Promise<RoutineDetail> {
    const routine = await this.routines.findById(id);
    if (!routine) throw routineNotFound(id);
    return routine;
  }

  create(input: RoutineInput): Promise<RoutineDetail> {
    return this.routines.create(input);
  }

  async update(id: string, input: RoutineUpdate): Promise<RoutineDetail> {
    const updated = await this.routines.update(id, input);
    if (!updated) throw routineNotFound(id);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.routines.delete(id);
    if (!deleted) throw routineNotFound(id);
  }

  async assertExists(id: string): Promise<void> {
    if (!(await this.routines.exists(id))) throw routineNotFound(id);
  }
}
