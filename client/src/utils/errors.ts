import { ApiRequestError } from '../services/http-client';
import { LIMITS } from './limits';

/** User-facing (Spanish) messages for the API error codes. */
const MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'No se pudo conectar con el servidor. ¿Está la API arrancada?',
  ROUTINE_NOT_FOUND: 'La rutina no existe o ha sido eliminada.',
  EXERCISE_NOT_FOUND: 'El ejercicio no existe o ha sido eliminado.',
  VALIDATION_ERROR: 'Hay datos no válidos. Revisa el formulario.',
  INVALID_EXERCISE_ORDER: 'El orden de los ejercicios ha cambiado. Recarga la página.',
  EXERCISE_LIMIT_REACHED: `Una rutina no puede tener más de ${LIMITS.EXERCISES_PER_ROUTINE_MAX} ejercicios.`,
  PAYLOAD_TOO_LARGE: 'Los datos enviados son demasiado grandes.',
  INTERNAL_ERROR: 'Error inesperado del servidor. Inténtalo de nuevo más tarde.',
};

const FALLBACK = 'Ha ocurrido un error inesperado.';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return MESSAGES[error.code] ?? FALLBACK;
  return FALLBACK;
}

/** Field-level details sent by the API on validation errors. */
export function getErrorDetails(error: unknown): string[] {
  if (!(error instanceof ApiRequestError)) return [];
  return error.details.map((detail) => `${detail.path}: ${detail.message}`);
}
