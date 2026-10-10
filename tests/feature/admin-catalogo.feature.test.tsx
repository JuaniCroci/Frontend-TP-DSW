/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiClient } from '@/core/api/api.client';
import App from '../../src/App';
import {
  MarcasAdminPage,
  ProveedoresAdminPage,
  TiposProductoAdminPage,
} from '@/features/admin/pages/AdminCatalogoPages';

const adapterOriginal = apiClient.defaults.adapter;

const marca = {
  id: 1,
  nombre: 'Star Nutrition',
  activo: true,
  createdAt: '2026-10-09T20:21:22.305Z',
  updatedAt: '2026-10-09T20:21:22.305Z',
};

const tipo = {
  id: 2,
  nombre: 'Suplemento',
  descripcion: 'Nutrición deportiva',
  activo: true,
  createdAt: '2026-10-09T20:21:22.305Z',
  updatedAt: '2026-10-09T20:21:22.305Z',
};

const proveedor = {
  id: 3,
  razonSocial: 'Distribuidora Norte',
  cuit: '20301234567',
  telefono: '1122334455',
  email: 'ventas@example.test',
  domicilio: 'Calle 123',
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

function renderMasterPage(page: 'marcas' | 'tipos-producto' | 'proveedores') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/admin/${page}`]}>
        <Routes>
          <Route path="/admin/marcas" element={<MarcasAdminPage />} />
          <Route path="/admin/tipos-producto" element={<TiposProductoAdminPage />} />
          <Route path="/admin/proveedores" element={<ProveedoresAdminPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function saveSession(rol: 'ADMIN' | 'CLIENTE') {
  localStorage.setItem('entreno_token', 'token-de-prueba');
  localStorage.setItem(
    'entreno_user',
    JSON.stringify({
      id: 1,
      nombre: rol === 'ADMIN' ? 'Administradora' : 'Cliente',
      email: `${rol.toLowerCase()}@entreno.test`,
      rol,
    }),
  );
}

describe('administración de marcas, tipos y proveedores', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
    apiClient.defaults.adapter = adapterOriginal;
    vi.restoreAllMocks();
  });

  it('redirige al login cuando un usuario anónimo entra a administración', async () => {
    window.history.replaceState({}, '', '/admin/marcas');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('bloquea al cliente y no muestra navegación administrativa', async () => {
    saveSession('CLIENTE');
    window.history.replaceState({}, '', '/admin/marcas');
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Tu próximo objetivo empieza acá.' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Administración' })).not.toBeInTheDocument();
  });

  it('permite a ADMIN crear marcas y actualiza el listado', async () => {
    const requests: Array<{ method?: string; url?: string; data?: unknown; params?: unknown }> = [];
    let marcas = [marca];
    apiClient.defaults.adapter = async (config) => {
      requests.push({
        method: config.method,
        url: config.url,
        data: config.data,
        params: config.params,
      });
      if (config.url === '/api/marcas' && config.method === 'get') {
        return response(config, { data: marcas, total: marcas.length });
      }
      if (config.url === '/api/marcas' && config.method === 'post') {
        const created = { ...marca, id: 4, ...(requestBody(config.data) as object) };
        marcas = [...marcas, created];
        return response(config, created, 201);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    saveSession('ADMIN');
    window.history.replaceState({}, '', '/admin/marcas');
    render(<App />);

    expect(await screen.findByText('Star Nutrition')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Administración' })).toBeInTheDocument();
    expect(requests[0].params).toEqual({ includeInactive: true });

    fireEvent.click(screen.getByRole('button', { name: 'Crear marcas' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nueva marca' } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));

    expect(await screen.findByText('Registro creado correctamente.')).toBeInTheDocument();
    expect(await screen.findByText('Nueva marca')).toBeInTheDocument();
    expect(requests.some((request) => request.method === 'post')).toBe(true);
    expect(requestBody(requests.find((request) => request.method === 'post')?.data)).toEqual({
      nombre: 'Nueva marca',
    });
  });

  it('muestra el detalle recibido de la API y permite editar una marca', async () => {
    let currentMarca = marca;
    let updateBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/marcas' && config.method === 'get') {
        return response(config, { data: [currentMarca], total: 1 });
      }
      if (config.url === '/api/marcas/1' && config.method === 'get') {
        return response(config, currentMarca);
      }
      if (config.url === '/api/marcas/1' && config.method === 'put') {
        updateBody = requestBody(config.data);
        currentMarca = { ...currentMarca, ...(requestBody(config.data) as object) };
        return response(config, currentMarca);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderMasterPage('marcas');
    expect(await screen.findByText('Star Nutrition')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));
    const detailDialog = await screen.findByRole('dialog');
    expect(await within(detailDialog).findByText('Star Nutrition')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }));

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Star Nutrition Argentina' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Cambios guardados correctamente.')).toBeInTheDocument();
    expect(updateBody).toEqual({ nombre: 'Star Nutrition Argentina' });
    expect(await screen.findByText('Star Nutrition Argentina')).toBeInTheDocument();
  });

  it('confirma la baja lógica y conserva el registro como inactivo', async () => {
    let currentMarca = marca;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/marcas' && config.method === 'get') {
        return response(config, { data: [currentMarca], total: 1 });
      }
      if (config.url === '/api/marcas/1' && config.method === 'delete') {
        currentMarca = { ...currentMarca, activo: false };
        return response(config, null, 204);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderMasterPage('marcas');
    expect(await screen.findByText('Star Nutrition')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Desactivar' }));

    expect(await screen.findByText('Registro desactivado correctamente.')).toBeInTheDocument();
    expect(await screen.findByText('Inactivo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Desactivar' })).not.toBeInTheDocument();
  });

  it('muestra el error de duplicado del backend sin indicar éxito', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/marcas' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      return Promise.reject({
        isAxiosError: true,
        config,
        response: {
          data: { statusCode: 409, message: 'Ya existe una marca con ese nombre' },
          status: 409,
          statusText: 'Conflict',
          headers: {},
        },
      });
    };

    renderMasterPage('marcas');
    await screen.findByText('Todavía no hay registros.');
    fireEvent.click(screen.getByRole('button', { name: 'Crear marcas' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Duplicada' } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe una marca con ese nombre',
    );
    expect(screen.queryByText('Registro creado correctamente.')).not.toBeInTheDocument();
  });

  it('muestra los errores de validación de la API junto al campo', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/marcas' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      return Promise.reject({
        isAxiosError: true,
        config,
        response: {
          data: {
            statusCode: 400,
            message: 'Error de validación',
            details: [{ field: 'nombre', message: 'nombre debe tener al menos 2 caracteres' }],
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
        },
      });
    };

    renderMasterPage('marcas');
    await screen.findByText('Todavía no hay registros.');
    fireEvent.click(screen.getByRole('button', { name: 'Crear marcas' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Marca válida' } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Error de validación');
    expect(screen.getByText('nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
  });

  it('usa los campos propios de tipos de producto y proveedores', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/tipos-producto') {
        return response(config, { data: [tipo], total: 1 });
      }
      if (config.url === '/api/proveedores') {
        return response(config, { data: [proveedor], total: 1 });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    const { unmount } = renderMasterPage('tipos-producto');
    expect(await screen.findByText('Nutrición deportiva')).toBeInTheDocument();
    unmount();

    renderMasterPage('proveedores');
    expect(await screen.findByText('Distribuidora Norte')).toBeInTheDocument();
    expect(screen.getByText('20301234567')).toBeInTheDocument();
  });

  it('crea un tipo de producto con nombre y descripción opcional', async () => {
    let createBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/tipos-producto' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      if (config.url === '/api/tipos-producto' && config.method === 'post') {
        createBody = requestBody(config.data);
        return response(config, tipo, 201);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderMasterPage('tipos-producto');
    await screen.findByText('Todavía no hay registros.');
    fireEvent.click(screen.getByRole('button', { name: 'Crear tipos de producto' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Suplemento' } });
    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Nutrición deportiva' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));

    expect(await screen.findByText('Registro creado correctamente.')).toBeInTheDocument();
    expect(createBody).toEqual({ nombre: 'Suplemento', descripcion: 'Nutrición deportiva' });
  });

  it('crea un proveedor con CUIT y campos opcionales', async () => {
    let createBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/proveedores' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      if (config.url === '/api/proveedores' && config.method === 'post') {
        createBody = requestBody(config.data);
        return response(config, proveedor, 201);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderMasterPage('proveedores');
    await screen.findByText('Todavía no hay registros.');
    fireEvent.click(screen.getByRole('button', { name: 'Crear proveedores' }));
    fireEvent.change(screen.getByLabelText('Razón social'), {
      target: { value: 'Distribuidora Norte' },
    });
    fireEvent.change(screen.getByLabelText('CUIT (11 dígitos)'), {
      target: { value: '20301234567' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ventas@example.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));

    expect(await screen.findByText('Registro creado correctamente.')).toBeInTheDocument();
    expect(createBody).toEqual({
      razonSocial: 'Distribuidora Norte',
      cuit: '20301234567',
      email: 'ventas@example.test',
    });
  });
});
