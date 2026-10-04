import { describe, expect, it } from 'vitest';
import { ApiError, toApiError } from '@/core/api/apiError';

function respuestaFallida(status: number, data: unknown) {
  return { isAxiosError: true, response: { status, data } };
}

function errorDeRed() {
  return { isAxiosError: true };
}

describe('toApiError', () => {
  it('lee statusCode y message del envelope de error del backend', () => {
    const error = toApiError(
      respuestaFallida(404, { statusCode: 404, message: 'Marca no encontrada' }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Marca no encontrada');
  });

  it('expone details[] cuando el backend valida el body', () => {
    const error = toApiError(
      respuestaFallida(400, {
        statusCode: 400,
        message: 'Error de validación',
        details: [{ field: 'nombre', message: 'nombre no debe estar vacío' }],
      }),
    );

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Error de validación');
    expect(error.details).toEqual([{ field: 'nombre', message: 'nombre no debe estar vacío' }]);
  });

  it('usa el status HTTP cuando el payload no trae statusCode', () => {
    const error = toApiError(respuestaFallida(502, { message: 'Bad gateway' }));

    expect(error.statusCode).toBe(502);
    expect(error.message).toBe('Bad gateway');
  });

  it('usa un mensaje genérico cuando el payload no trae message', () => {
    const error = toApiError(respuestaFallida(500, {}));

    expect(error.statusCode).toBe(500);
    expect(error.message).toContain('500');
  });

  it('sin respuesta (red caída) responde statusCode 0 con mensaje claro', () => {
    const error = toApiError(errorDeRed());

    expect(error.statusCode).toBe(0);
    expect(error.message).toBe('No se pudo conectar con el servidor');
  });

  it('propaga errores que no son de axios como statusCode 0', () => {
    const error = toApiError(new Error('boom'));

    expect(error.statusCode).toBe(0);
    expect(error.message).toBe('boom');
  });

  it('normaliza un 409 (conflicto de negocio) con su mensaje', () => {
    const error = toApiError(
      respuestaFallida(409, { statusCode: 409, message: 'El producto ya está en uso' }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('El producto ya está en uso');
  });

  it('normaliza un body no-JSON (HTML de proxy) sin crashear', () => {
    const error = toApiError(respuestaFallida(502, '<html><body>Bad Gateway</body></html>'));

    expect(error.statusCode).toBe(502);
    expect(error.message).toContain('502');
    expect(error.details).toBeUndefined();
  });
});
