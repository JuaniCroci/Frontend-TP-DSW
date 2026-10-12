import type { ApiErrorDetails } from '../../core/api/apiError';

export function detailsToFieldErrors(details?: ApiErrorDetails[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const { field, message } of details ?? []) {
    if (!(field in errors)) errors[field] = message;
  }
  return errors;
}
