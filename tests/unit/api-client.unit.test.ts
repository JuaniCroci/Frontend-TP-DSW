/** @vitest-environment jsdom */
import type { AxiosHeaderValue } from 'axios';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiAssetUrl, apiClient, requireBaseUrl, TOKEN_KEY } from '@/core/api/api.client';

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

describe('apiAssetUrl', () => {
  const baseURLOriginal = apiClient.defaults.baseURL;

  afterEach(() => {
    apiClient.defaults.baseURL = baseURLOriginal;
  });

  it('resuelve rutas relativas contra la baseURL sin prefijo', () => {
    apiClient.defaults.baseURL = 'http://localhost:3000';

    expect(apiAssetUrl('uploads/ab.png')).toBe('http://localhost:3000/uploads/ab.png');
  });

  it('conserva el path de la baseURL cuando la API vive bajo un prefijo', () => {
    apiClient.defaults.baseURL = 'http://localhost:3000/api';

    expect(apiAssetUrl('uploads/ab.png')).toBe('http://localhost:3000/api/uploads/ab.png');
    expect(apiAssetUrl('/uploads/ab.png')).toBe('http://localhost:3000/api/uploads/ab.png');
  });

  it('devuelve tal cual las rutas absolutas', () => {
    apiClient.defaults.baseURL = 'http://localhost:3000/api';

    expect(apiAssetUrl('http://cdn.test/ab.png')).toBe('http://cdn.test/ab.png');
  });
});
