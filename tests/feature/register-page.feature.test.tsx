/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AxiosAdapter } from 'axios';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import RegisterPage from '@/features/auth/pages/RegisterPage';

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
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
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

    fireEvent.click(screen.getByTestId('auth-register-submit'));

    expect(await screen.findByTestId('login-marker')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('con 409 muestra el aviso junto al campo email', async () => {
    apiClient.defaults.adapter = mockApiResponse(409, {
      statusCode: 409,
      message: 'Ya existe un usuario con ese email',
    });
    renderRegisterPage();
    fillRegisterForm();

    fireEvent.click(screen.getByTestId('auth-register-submit'));

    expect(await screen.findByText('Ya existe un usuario con ese email')).toBeInTheDocument();
  });

  it('con password menor a 8 caracteres falla en cliente y no llama a la red', async () => {
    let requestCount = 0;
    apiClient.defaults.adapter = async (config) => {
      requestCount += 1;
      return { data: {}, status: 201, statusText: 'Created', headers: {}, config };
    };
    renderRegisterPage();
    fillRegisterForm('abc');

    fireEvent.click(screen.getByTestId('auth-register-submit'));

    expect(await screen.findByText('Debe tener al menos 8 caracteres')).toBeInTheDocument();
    expect(requestCount).toBe(0);
  });
});
