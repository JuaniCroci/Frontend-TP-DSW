import axios from 'axios';

export interface ApiErrorDetails {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: ApiErrorDetails[];

  constructor(statusCode: number, message: string, details?: ApiErrorDetails[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface EnvelopeBackend {
  statusCode?: number;
  message?: string;
  details?: ApiErrorDetails[];
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError(0, 'No se pudo conectar con el servidor');
    }

    const payload = (error.response.data ?? {}) as EnvelopeBackend;
    const statusCode =
      typeof payload.statusCode === 'number' ? payload.statusCode : error.response.status;
    const message =
      typeof payload.message === 'string'
        ? payload.message
        : `Error inesperado del servidor (${statusCode})`;
    const details = Array.isArray(payload.details) ? payload.details : undefined;

    return new ApiError(statusCode, message, details);
  }

  if (error instanceof Error) return new ApiError(0, error.message);
  return new ApiError(0, 'Error desconocido');
}
