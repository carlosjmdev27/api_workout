import type { RoutineDetail, RoutineInput, RoutineSummary, RoutineUpdate } from '@gym/shared';
import type { RoutineRepository } from '../repositories/routine.repository.js';
import type { AccessGuard } from './access.guard.js';
import { routineNotFound } from './errors.js';

/** Business logic for routines. Knows nothing about HTTP or SQL. Every call is scoped to a user. */
export class RoutineService {
  private readonly routines: RoutineRepository;
  private readonly access: AccessGuard;

  constructor(routines: RoutineRepository, access: AccessGuard) {
    this.routines = routines;
    this.access = access;
  }

  list(userId: string): Promise<RoutineSummary[]> {
    return this.routines.findAll(userId);
  }

  async getById(userId: string, id: string): Promise<RoutineDetail> {
    await this.access.assertRoutine(userId, id);
    const routine = await this.routines.findById(id);
    if (!routine) throw routineNotFound(id);
    return routine;
  }

  create(userId: string, input: RoutineInput): Promise<RoutineDetail> {
    return this.routines.create(userId, input);
  }

  async update(userId: string, id: string, input: RoutineUpdate): Promise<RoutineDetail> {
    await this.access.assertRoutine(userId, id);
    const updated = await this.routines.update(id, input);
    if (!updated) throw routineNotFound(id);
    return this.getById(userId, id);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.access.assertRoutine(userId, id);
    const deleted = await this.routines.delete(id);
    if (!deleted) throw routineNotFound(id);
  }
}
