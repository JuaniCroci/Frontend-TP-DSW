/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import { TOKEN_KEY, clearSession, getToken, setToken } from '@/core/auth/session';

describe('session storage del token', () => {
  afterEach(() => localStorage.clear());

  it('devuelve null cuando no hay token guardado', () => {
    expect(getToken()).toBeNull();
  });

  it('setToken escribe el token bajo TOKEN_KEY y getToken lo lee', () => {
    setToken('jwt-de-prueba');

    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-de-prueba');
    expect(getToken()).toBe('jwt-de-prueba');
  });

  it('clearSession elimina el token guardado', () => {
    setToken('jwt-de-prueba');

    clearSession();

    expect(getToken()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
