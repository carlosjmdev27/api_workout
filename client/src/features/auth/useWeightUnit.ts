import { DEFAULT_WEIGHT_UNIT, type WeightUnit } from '@gym/shared';
import { useAuth } from './auth-context';

/**
 * The logged-in user's preferred weight unit ('kg' by default). Labels only: numbers are
 * shown as stored, in the unit the user had when typing them.
 */
export function useWeightUnit(): WeightUnit {
  const { state } = useAuth();
  return state.status === 'authenticated' ? state.user.weightUnit : DEFAULT_WEIGHT_UNIT;
}
