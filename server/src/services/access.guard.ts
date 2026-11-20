import type { NotFoundError } from '../errors/app-error.js';
import type { Owner, OwnershipRepository } from '../repositories/ownership.repository.js';
import { dayNotFound, exerciseNotFound, routineNotFound, sessionNotFound } from './errors.js';

/**
 * Ownership checks shared by every service. Another user's resource answers exactly
 * like a missing one (404), so ids of other accounts cannot be probed.
 */
export class AccessGuard {
  private readonly owners: OwnershipRepository;

  constructor(owners: OwnershipRepository) {
    this.owners = owners;
  }

  async assertRoutine(userId: string, routineId: string): Promise<void> {
    this.check(await this.owners.routineOwner(routineId), userId, () => routineNotFound(routineId));
  }

  async assertDay(userId: string, dayId: string): Promise<void> {
    this.check(await this.owners.dayOwner(dayId), userId, () => dayNotFound(dayId));
  }

  async assertExercise(userId: string, exerciseId: string): Promise<void> {
    this.check(await this.owners.exerciseOwner(exerciseId), userId, () => exerciseNotFound(exerciseId));
  }

  async assertSession(userId: string, sessionId: string): Promise<void> {
    this.check(await this.owners.sessionOwner(sessionId), userId, () => sessionNotFound(sessionId));
  }

  /** Unclaimed rows (owner null) belong to nobody until the first account claims them. */
  private check(owner: Owner, userId: string, notFound: () => NotFoundError): void {
    if (owner !== userId) throw notFound();
  }
}
