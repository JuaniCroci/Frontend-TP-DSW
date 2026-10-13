import { describe, expect, it } from 'vitest';
import { ApiError } from '@/core/api/apiError';
import { friendlyErrorMessage, getApiErrorMessage } from '@/core/api/friendlyError';

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

describe('getApiErrorMessage', () => {
  it('devuelve el mensaje de un ApiError tal cual', () => {
    expect(getApiErrorMessage(new ApiError(409, 'El email ya está registrado'))).toBe(
      'El email ya está registrado',
    );
  });

  it('aplica el copy amigable del 429 aunque venga como ApiError crudo', () => {
    expect(getApiErrorMessage(new ApiError(429, 'Too many requests'))).toBe(
      'Demasiados intentos. Esperá unos minutos y volvé a intentar.',
    );
  });

  it('preserva el mensaje de un Error genérico', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('usa un fallback para valores que no son errores', () => {
    expect(getApiErrorMessage('algo raro')).toBe('Error desconocido');
    expect(getApiErrorMessage(undefined)).toBe('Error desconocido');
  });
});
