/** @vitest-environment jsdom */
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, TOKEN_KEY } from '@/core/api/api.client';

const adapterOriginal = apiClient.defaults.adapter;
const sessionExpiredListeners: Array<(event: Event) => void> = [];

function trackSessionExpired() {
  const onExpired = vi.fn();
  window.addEventListener('auth:session-expired', onExpired);
  sessionExpiredListeners.push(onExpired);
  return onExpired;
}

function rejectWith401(config: InternalAxiosRequestConfig): Promise<never> {
  const error = {
    isAxiosError: true,
    config,
    response: {
      status: 401,
      data: { statusCode: 401, message: 'Token inválido' },
    },
  } as AxiosError;
  return Promise.reject(error);
}

describe('interceptor de 401: cierre de sesión', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    while (sessionExpiredListeners.length > 0) {
      const listener = sessionExpiredListeners.pop();
      if (listener) window.removeEventListener('auth:session-expired', listener);
    }
    apiClient.defaults.adapter = adapterOriginal;
    vi.restoreAllMocks();
  });

  it('limpia el token y notifica a los listeners cuando un endpoint normal responde 401', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-vencido');
    const onExpired = trackSessionExpired();
    apiClient.defaults.adapter = (config) => rejectWith401(config);

    await expect(apiClient.get('/api/pedidos')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Token inválido',
    });

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('no toca la sesión cuando el 401 viene de un endpoint de auth', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-de-otra-sesion');
    const onExpired = trackSessionExpired();
    apiClient.defaults.adapter = (config) => rejectWith401(config);

    await expect(apiClient.post('/api/auth/login', {})).rejects.toMatchObject({ statusCode: 401 });

    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-de-otra-sesion');
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('no emite el evento cuando no había sesión iniciada', async () => {
    const onExpired = trackSessionExpired();
    apiClient.defaults.adapter = (config) => rejectWith401(config);

    await expect(apiClient.get('/api/pedidos')).rejects.toMatchObject({ statusCode: 401 });

    expect(onExpired).not.toHaveBeenCalled();
  });
});
