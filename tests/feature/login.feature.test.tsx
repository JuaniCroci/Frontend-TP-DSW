/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import { AuthProvider } from '@/core/auth/AuthProvider';
import LoginPage from '@/features/auth/pages/LoginPage';

const adapterOriginal = apiClient.defaults.adapter;

describe('login', () => {
  afterEach(() => {
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('muestra el estado de carga y luego informa credenciales inválidas', async () => {
    let rechazar: (() => void) | undefined;
    apiClient.defaults.adapter = (config) =>
      new Promise<AxiosResponse>((_resolve, reject) => {
        rechazar = () =>
          reject({
            isAxiosError: true,
            config,
            response: {
              data: { statusCode: 401, message: 'Credenciales inválidas' },
              status: 401,
              statusText: 'Unauthorized',
              headers: {},
            },
          });
      });

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'cliente@entreno.test' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'incorrecta' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    const loadingButton = await screen.findByRole('button', { name: 'Ingresando...' });
    expect(loadingButton).toBeDisabled();
    await waitFor(() => expect(rechazar).toBeDefined());

    rechazar?.();

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  });
});
