/**
 * Who owns each resource. `undefined` = it does not exist; `null` = it exists but has
 * no owner yet (data created before login, waiting for the first account).
 */
export type Owner = string | null | undefined;

export interface OwnershipRepository {
  routineOwner(routineId: string): Promise<Owner>;
  /** Owner of the routine the day belongs to. */
  dayOwner(dayId: string): Promise<Owner>;
  /** Owner of the routine of the day the exercise belongs to. */
  exerciseOwner(exerciseId: string): Promise<Owner>;
  sessionOwner(sessionId: string): Promise<Owner>;
}
