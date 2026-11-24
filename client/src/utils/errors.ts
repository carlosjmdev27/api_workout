import { LIMITS } from '@gym/shared';
import { ApiRequestError } from '../services/http-client';

/** User-facing (Spanish) messages for the API error codes. */
const MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'No se pudo conectar con el servidor. ¿Está la API arrancada?',
  ROUTINE_NOT_FOUND: 'La rutina no existe o ha sido eliminada.',
  DAY_NOT_FOUND: 'La tabla no existe o ha sido eliminada.',
  EXERCISE_NOT_FOUND: 'El ejercicio no existe o ha sido eliminado.',
  SESSION_NOT_FOUND: 'La sesión no existe o ha sido eliminada.',
  VALIDATION_ERROR: 'Hay datos no válidos. Revisa el formulario.',
  INVALID_DAY_ORDER: 'El orden de las tablas ha cambiado. Recarga la página.',
  INVALID_EXERCISE_ORDER: 'El orden de los ejercicios ha cambiado. Recarga la página.',
  DAY_LIMIT_REACHED: `Una rutina no puede tener más de ${LIMITS.DAYS_PER_ROUTINE_MAX} tablas.`,
  EXERCISE_LIMIT_REACHED: `Una tabla no puede tener más de ${LIMITS.EXERCISES_PER_DAY_MAX} ejercicios.`,
  INVALID_SESSION_EXERCISE: 'La sesión incluye ejercicios que ya no están en la tabla. Recarga la página.',
  INVALID_SESSION_DATE: 'La fecha del entrenamiento no puede ser futura.',
  INVALID_SESSION_DURATION: 'El entrenamiento dura demasiado (más de 10 h). Descártalo y empieza de nuevo.',
  CATALOG_EXERCISE_EXISTS: 'Ese ejercicio ya existe en el catálogo: búscalo en la lista.',
  INVALID_CATALOG_EXERCISE: 'El ejercicio del catálogo ya no existe. Elígelo de nuevo.',
  PAYLOAD_TOO_LARGE: 'Los datos enviados son demasiado grandes.',
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos.',
  EMAIL_IN_USE: 'Ya existe una cuenta con ese email.',
  INVALID_CURRENT_PASSWORD: 'La contraseña actual es incorrecta.',
  REGISTRATION_CLOSED: 'El registro de cuentas nuevas está cerrado.',
  TOO_MANY_REQUESTS: 'Demasiados intentos. Espera 15 minutos y vuelve a probar.',
  UNAUTHORIZED: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
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
