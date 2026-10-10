/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import AdminClientesPage from '@/features/admin/pages/AdminClientesPage';

const adapterOriginal = apiClient.defaults.adapter;

const cliente = {
  id: 12,
  nombre: 'Ana Cliente',
  email: 'ana@example.test',
  telefono: '1122334455',
  direccion: 'Calle 123',
  rol: 'CLIENTE' as const,
  activo: true,
  createdAt: '2026-10-09T20:21:22.305Z',
  updatedAt: '2026-10-09T20:21:22.305Z',
};

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 204 ? 'No Content' : 'OK',
    headers: new AxiosHeaders(),
    config,
  };
}

function requestBody(data: unknown): unknown {
  return typeof data === 'string' ? JSON.parse(data) : data;
}

function saveAdminSession() {
  localStorage.setItem('entreno_token', 'token-de-prueba');
  localStorage.setItem(
    'entreno_user',
    JSON.stringify({
      id: 1,
      nombre: 'Administradora',
      email: 'admin@entreno.test',
      rol: 'ADMIN',
    }),
  );
}

function renderClientesPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/clientes']}>
        <Routes>
          <Route path="/admin/clientes" element={<AdminClientesPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('administración de clientes', () => {
  beforeEach(() => {
    localStorage.clear();
    saveAdminSession();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    apiClient.defaults.adapter = adapterOriginal;
    vi.restoreAllMocks();
  });

  it('envía los filtros de búsqueda y estado que admite la API', async () => {
    const requests: Array<{ url?: string; params?: unknown }> = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push({ url: config.url, params: config.params });
      if (config.url === '/api/clientes' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderClientesPage();
    await screen.findByText('No hay clientes para estos filtros.');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar por nombre o email' }), {
      target: { value: 'ana' },
    });
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'inactivos' } });

    await waitFor(() =>
      expect(requests).toContainEqual({
        url: '/api/clientes',
        params: { q: 'ana', activo: false },
      }),
    );
  });

  it('crea un cliente con los datos DTO y no agrega campos administrativos', async () => {
    let createBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/clientes' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      if (config.url === '/api/clientes' && config.method === 'post') {
        createBody = requestBody(config.data);
        return response(config, { ...cliente, ...(createBody as object) }, 201);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderClientesPage();
    await screen.findByText('No hay clientes para estos filtros.');
    fireEvent.click(screen.getByRole('button', { name: 'Crear cliente' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana Cliente' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.test' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: 'password-seguro' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '1122334455' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Cliente creado correctamente.')).toBeInTheDocument();
    expect(createBody).toEqual({
      nombre: 'Ana Cliente',
      email: 'ana@example.test',
      password: 'password-seguro',
      telefono: '1122334455',
    });
    expect(JSON.stringify(createBody)).not.toContain('rol');
    expect(JSON.stringify(createBody)).not.toContain('passwordHash');
  });

  it('muestra detalle y edita sin enviar una contraseña salvo que se solicite', async () => {
    let currentCliente = cliente;
    let updateBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/clientes' && config.method === 'get') {
        return response(config, { data: [currentCliente], total: 1 });
      }
      if (config.url === '/api/clientes/12' && config.method === 'get') {
        return response(config, currentCliente);
      }
      if (config.url === '/api/clientes/12' && config.method === 'put') {
        updateBody = requestBody(config.data);
        currentCliente = { ...currentCliente, ...(updateBody as object) };
        return response(config, currentCliente);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderClientesPage();
    expect(await screen.findByText('ana@example.test')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));
    expect(await screen.findByRole('heading', { name: 'Detalle del cliente' })).toBeInTheDocument();
    expect(screen.queryByText(/passwordHash|password-seguro/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }));

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByRole('checkbox', { name: 'Cambiar contraseña' })).not.toBeChecked();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana Nueva' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Cliente actualizado correctamente.')).toBeInTheDocument();
    expect(updateBody).toEqual({
      nombre: 'Ana Nueva',
      email: 'ana@example.test',
      telefono: '1122334455',
      direccion: 'Calle 123',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Cambiar contraseña' }));
    fireEvent.change(screen.getByLabelText(/Contraseña nueva/), {
      target: { value: 'otra-clave-segura' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(updateBody).toMatchObject({ password: 'otra-clave-segura' }));
  });

  it('activa y desactiva explícitamente usando los endpoints dedicados', async () => {
    let currentCliente = cliente;
    const patchUrls: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/clientes' && config.method === 'get') {
        return response(config, { data: [currentCliente], total: 1 });
      }
      if (config.url?.startsWith('/api/clientes/12/') && config.method === 'patch') {
        patchUrls.push(config.url);
        currentCliente = { ...currentCliente, activo: config.url.endsWith('/activar') };
        return response(config, currentCliente);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderClientesPage();
    expect(await screen.findByRole('button', { name: 'Desactivar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Desactivar' }));
    expect(await screen.findByText('Cliente desactivado correctamente.')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Activar' }));
    expect(await screen.findByText('Cliente activado correctamente.')).toBeInTheDocument();

    expect(patchUrls).toEqual(['/api/clientes/12/desactivar', '/api/clientes/12/activar']);
    expect(window.confirm).toHaveBeenCalledTimes(2);
  });

  it('muestra errores de duplicado de email devueltos por el backend', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/clientes' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      return Promise.reject({
        isAxiosError: true,
        config,
        response: {
          data: { statusCode: 409, message: 'Ya existe un usuario con ese email' },
          status: 409,
          statusText: 'Conflict',
          headers: {},
        },
      });
    };

    renderClientesPage();
    await screen.findByText('No hay clientes para estos filtros.');
    fireEvent.click(screen.getByRole('button', { name: 'Crear cliente' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana Cliente' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.test' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: 'password-seguro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe un usuario con ese email',
    );
    expect(screen.queryByText('Cliente creado correctamente.')).not.toBeInTheDocument();
  });
});
