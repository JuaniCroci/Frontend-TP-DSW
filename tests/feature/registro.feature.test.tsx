/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import { AuthProvider } from '@/core/auth/AuthProvider';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';

const adapterOriginal = apiClient.defaults.adapter;

function response(config: InternalAxiosRequestConfig, data: unknown, status = 201): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 201 ? 'Created' : 'OK',
    headers: new AxiosHeaders(),
    config,
  };
}

function requestBody(data: unknown): unknown {
  return typeof data === 'string' ? JSON.parse(data) : data;
}

function renderRegistration() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/registro']}>
        <Routes>
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('registro público', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('crea una cuenta pública y luego permite iniciar sesión desde la pantalla de login', async () => {
    let registrationBody: unknown;
    const requests: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push(`${config.method} ${config.url}`);
      if (config.url === '/api/auth/register' && config.method === 'post') {
        registrationBody = requestBody(config.data);
        return response(config, {
          id: 31,
          nombre: 'Nueva Cliente',
          email: 'nueva@example.test',
          telefono: null,
          direccion: null,
          rol: 'CLIENTE',
          activo: true,
          createdAt: '2026-10-11T12:00:00.000Z',
          updatedAt: '2026-10-11T12:00:00.000Z',
        });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderRegistration();
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Nueva Cliente' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'nueva@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'clave-segura-123' },
    });
    fireEvent.change(screen.getByLabelText('Teléfono (opcional)'), {
      target: { value: '1122334455' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(
      await screen.findByText('Cuenta creada correctamente. Ahora podés iniciar sesión.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(registrationBody).toEqual({
      nombre: 'Nueva Cliente',
      email: 'nueva@example.test',
      password: 'clave-segura-123',
      telefono: '1122334455',
    });
    expect(requests).toEqual(['post /api/auth/register']);
    expect(localStorage.getItem('entreno_token')).toBeNull();
  });

  it('muestra errores de registro del backend sin navegar al login', async () => {
    apiClient.defaults.adapter = async (config) =>
      Promise.reject({
        isAxiosError: true,
        config,
        response: {
          data: { statusCode: 409, message: 'Ya existe un usuario con ese email' },
          status: 409,
          statusText: 'Conflict',
          headers: {},
        },
      });

    renderRegistration();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nueva Cliente' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'existente@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'clave-segura-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe un usuario con ese email',
    );
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('valida la longitud mínima de contraseña antes de consultar la API', async () => {
    let requestCount = 0;
    apiClient.defaults.adapter = async (config) => {
      requestCount += 1;
      return response(config, {});
    };

    renderRegistration();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nueva Cliente' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nueva@example.test' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'corta' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(
      await screen.findByText('La contraseña debe tener al menos 8 caracteres.'),
    ).toBeInTheDocument();
    expect(requestCount).toBe(0);
  });
});
