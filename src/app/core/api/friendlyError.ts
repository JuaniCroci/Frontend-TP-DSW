import type { ApiError } from './apiError';
import { toApiError } from './apiError';

export function friendlyErrorMessage(error: ApiError): string {
  if (error.statusCode === 429) {
    return 'Demasiados intentos. Esperá unos minutos y volvé a intentar.';
  }
  return error.message;
}

export function getApiErrorMessage(error: unknown): string {
  return friendlyErrorMessage(toApiError(error));
}
