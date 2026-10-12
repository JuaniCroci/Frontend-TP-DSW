import { describe, expect, it } from 'vitest';
import { detailsToFieldErrors } from '@/shared/utils/fieldErrors';

describe('detailsToFieldErrors', () => {
  it('devuelve un objeto vacío cuando no hay details', () => {
    expect(detailsToFieldErrors(undefined)).toEqual({});
  });

  it('toma el primer mensaje de cada campo y descarta los repetidos', () => {
    const errores = detailsToFieldErrors([
      { field: 'email', message: 'email debe ser un email válido' },
      { field: 'email', message: 'email no debe superar los 254 caracteres' },
      { field: 'password', message: 'password debe tener al menos 8 caracteres' },
    ]);

    expect(errores).toEqual({
      email: 'email debe ser un email válido',
      password: 'password debe tener al menos 8 caracteres',
    });
  });
});
