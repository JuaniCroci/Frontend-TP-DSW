/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiClient, TOKEN_KEY } from '@/core/api/api.client';
import { AuthProvider } from '@/core/auth/AuthProvider';
import LoginPage from '@/features/auth/pages/LoginPage';

const adapterOriginal = apiClient.defaults.adapter;

const userFixture = {
  id: 1,
  nombre: 'Ana Cliente',
  email: 'ana@entreno.com.ar',
  rol: 'CLIENTE' as const,
};

function mockApiResponse(status: number, data: unknown): void {
  apiClient.defaults.adapter = async (config) => {
    if (status >= 400) {
      return Promise.reject({
        isAxiosError: true,
        config,
        response: { status, statusText: '', headers: {}, config, data },
      });
    }
    return { data, status, statusText: 'OK', headers: {}, config };
  };
}

function renderLoginPage(): void {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<div data-testid="home-marker" />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function fillCredentials(): void {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@entreno.com.ar' } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'supersecret1' } });
}

function submitLoginForm(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('con 200 guarda el token y navega al home', async () => {
    mockApiResponse(200, {
      token: 'jwt-login',
      refreshToken: 'refresh-login',
      usuario: userFixture,
    });
    renderLoginPage();
    fillCredentials();

    submitLoginForm();

    expect(await screen.findByTestId('home-marker')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-login');
  });

  it('con 401 muestra "Credenciales inválidas"', async () => {
    mockApiResponse(401, { statusCode: 401, message: 'Credenciales inválidas' });
    renderLoginPage();
    fillCredentials();

    submitLoginForm();

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('con 400 con details informa el error sin perder el formulario', async () => {
    mockApiResponse(400, {
      statusCode: 400,
      message: 'Error de validación',
      details: [{ field: 'email', message: 'email debe ser un email válido' }],
    });
    renderLoginPage();
    fillCredentials();

    submitLoginForm();

    expect(await screen.findByRole('alert')).toHaveTextContent('Error de validación');
    expect(screen.getByLabelText('Email')).toHaveValue('ana@entreno.com.ar');
  });

  it('con 429 muestra el copy amigable de rate limit', async () => {
    mockApiResponse(429, 'Too many requests, please try again later.');
    renderLoginPage();
    fillCredentials();

    submitLoginForm();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Demasiados intentos. Esperá unos minutos y volvé a intentar.',
    );
  });
});
