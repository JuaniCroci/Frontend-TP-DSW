/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import { apiClient } from '@/core/api/api.client';

const adapterOriginal = apiClient.defaults.adapter;

describe('GET /api/health contra la API', () => {
  afterEach(() => {
    apiClient.defaults.adapter = adapterOriginal;
  });
  it('resuelve 200 con el estado del backend', async () => {
    apiClient.defaults.adapter = async (config) => ({
      data: { status: 'ok', database: 'up' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    const { data } = await apiClient.get('/api/health');

    expect(data).toEqual({ status: 'ok', database: 'up' });
  });

  it('convierte un 503 del backend en ApiError con su mensaje', async () => {
    apiClient.defaults.adapter = async () =>
      Promise.reject({
        isAxiosError: true,
        response: {
          status: 503,
          data: { statusCode: 503, message: 'Base de datos no disponible' },
        },
      });

    await expect(apiClient.get('/api/health')).rejects.toMatchObject({
      statusCode: 503,
      message: 'Base de datos no disponible',
    });
  });
});
