/** @vitest-environment jsdom */
import type { AxiosHeaderValue } from 'axios';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiClient, requireBaseUrl, TOKEN_KEY } from '@/core/api/api.client';

interface LlamadaCapturada {
  baseURL: string | undefined;
  authorization: AxiosHeaderValue;
}

const adapterOriginal = apiClient.defaults.adapter;

function capturarLlamadas(): LlamadaCapturada[] {
  const llamadas: LlamadaCapturada[] = [];
  apiClient.defaults.adapter = async (config) => {
    llamadas.push({
      baseURL: config.baseURL,
      authorization: config.headers.get('Authorization'),
    });
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
  };
  return llamadas;
}

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('usa VITE_API_URL como baseURL y la variable está definida', () => {
    expect(apiClient.defaults.baseURL).toBeTruthy();
    expect(apiClient.defaults.baseURL).toBe(import.meta.env.VITE_API_URL);
  });

  it('falla con mensaje claro cuando falta VITE_API_URL', () => {
    expect(() => requireBaseUrl(undefined)).toThrow(/VITE_API_URL/);
    expect(() => requireBaseUrl('')).toThrow(/VITE_API_URL/);
  });

  it('adjunta Authorization: Bearer cuando hay token guardado', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-de-prueba');
    const llamadas = capturarLlamadas();

    await apiClient.get('/api/health');

    expect(llamadas[0].authorization).toBe('Bearer jwt-de-prueba');
  });

  it('no adjunta Authorization cuando no hay token', async () => {
    const llamadas = capturarLlamadas();

    await apiClient.get('/api/health');

    expect(llamadas[0].authorization).toBeUndefined();
  });
});
