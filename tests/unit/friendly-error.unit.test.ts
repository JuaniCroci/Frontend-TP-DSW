import { describe, expect, it } from 'vitest';
import { ApiError } from '@/core/api/apiError';
import { friendlyErrorMessage } from '@/core/api/friendlyError';

describe('friendlyErrorMessage', () => {
  it('traduce el 429 (rate limit del back) a un copy amigable en español', () => {
    const mensaje = friendlyErrorMessage(
      new ApiError(429, 'Too many requests, please try again later.'),
    );

    expect(mensaje).toBe('Demasiados intentos. Esperá unos minutos y volvé a intentar.');
  });

  it('conserva el mensaje del envelope para un error de validación', () => {
    expect(friendlyErrorMessage(new ApiError(400, 'Error de validación'))).toBe(
      'Error de validación',
    );
  });

  it('conserva el mensaje de red del interceptor (statusCode 0)', () => {
    expect(friendlyErrorMessage(new ApiError(0, 'No se pudo conectar con el servidor'))).toBe(
      'No se pudo conectar con el servidor',
    );
  });
});
