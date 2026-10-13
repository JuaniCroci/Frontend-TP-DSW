/** @vitest-environment jsdom */
import type { AxiosAdapter } from 'axios';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiClient, TOKEN_KEY } from '@/core/api/api.client';
import { AuthProvider } from '@/core/auth/AuthProvider';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import { requestBody } from '../helpers/axios-adapter';

const adapterOriginal = apiClient.defaults.adapter;

const userFixture = {
  id: 2,
  nombre: 'Ana Cliente',
  email: 'ana@entreno.com.ar',
  telefono: null,
  direccion: null,
  rol: 'CLIENTE' as const,
  activo: true,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
};

function mockApiResponse(status: number, data: unknown): AxiosAdapter {
  return async (config) => {
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

function renderRegisterPage(): void {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/registro']}>
        <Routes>
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/login" element={<div data-testid="login-marker" />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function fillRegisterForm(password = 'supersecret1'): void {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana Cliente' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@entreno.com.ar' } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
}

function renderRegistrationFlow(): void {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/registro']}>
          <Routes>
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('con 201 navega a /login sin auto-login', async () => {
    apiClient.defaults.adapter = mockApiResponse(201, userFixture);
    renderRegisterPage();
    fillRegisterForm();

    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(await screen.findByTestId('login-marker')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('con 409 muestra el aviso junto al campo email sin navegar al login', async () => {
    apiClient.defaults.adapter = mockApiResponse(409, {
      statusCode: 409,
      message: 'Ya existe un usuario con ese email',
    });
    renderRegisterPage();
    fillRegisterForm();

    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(await screen.findByText('Ya existe un usuario con ese email')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.queryByTestId('login-marker')).not.toBeInTheDocument();
  });

  it('con password menor a 8 caracteres falla en cliente y no llama a la red', async () => {
    let requestCount = 0;
    apiClient.defaults.adapter = async (config) => {
      requestCount += 1;
      return { data: {}, status: 201, statusText: 'Created', headers: {}, config };
    };
    renderRegisterPage();
    fillRegisterForm('abc');

    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(
      await screen.findByText('La contraseña debe tener al menos 8 caracteres.'),
    ).toBeInTheDocument();
    expect(requestCount).toBe(0);
  });

  it('crea la cuenta con los datos del formulario y ofrece el login sin auto-sesión', async () => {
    let registrationBody: unknown;
    const requests: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push(`${config.method} ${config.url}`);
      if (config.url === '/api/auth/register' && config.method === 'post') {
        registrationBody = requestBody(config.data);
        return { data: userFixture, status: 201, statusText: 'Created', headers: {}, config };
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderRegistrationFlow();
    fillRegisterForm();
    fireEvent.change(screen.getByLabelText('Teléfono (opcional)'), {
      target: { value: '1122334455' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(
      await screen.findByText('Cuenta creada correctamente. Ahora podés iniciar sesión.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(registrationBody).toEqual({
      nombre: 'Ana Cliente',
      email: 'ana@entreno.com.ar',
      password: 'supersecret1',
      telefono: '1122334455',
    });
    expect(requests).toEqual(['post /api/auth/register']);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
