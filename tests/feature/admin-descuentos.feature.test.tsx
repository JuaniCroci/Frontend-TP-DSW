/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import AdminDescuentosPage from '@/features/admin/pages/AdminDescuentosPage';

const adapterOriginal = apiClient.defaults.adapter;

const descuento = {
  id: 8,
  descripcion: '10% llevando 2',
  cantidadMinima: 2,
  porcentaje: 10,
  activo: true,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
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

function renderDescuentosPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/descuentos']}>
        <Routes>
          <Route path="/admin/descuentos" element={<AdminDescuentosPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('administración de descuentos', () => {
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

  it('crea descuentos enviando cantidad y porcentaje como números', async () => {
    let descuentos: (typeof descuento)[] = [];
    let createBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/descuentos' && config.method === 'get') {
        return response(config, { data: descuentos, total: descuentos.length });
      }
      if (config.url === '/api/descuentos' && config.method === 'post') {
        createBody = requestBody(config.data);
        const body = createBody as Omit<typeof descuento, 'id' | 'createdAt' | 'updatedAt'>;
        descuentos = [{ ...descuento, ...body, id: 9 }];
        return response(config, descuentos[0], 201);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderDescuentosPage();
    await screen.findByText('Todavía no hay descuentos.');
    fireEvent.click(screen.getByRole('button', { name: 'Crear descuento' }));
    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: '15% llevando 3' },
    });
    fireEvent.change(screen.getByLabelText('Cantidad mínima por producto'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('Porcentaje de descuento'), {
      target: { value: '15' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Descuento creado correctamente.')).toBeInTheDocument();
    expect(createBody).toEqual({
      descripcion: '15% llevando 3',
      cantidadMinima: 3,
      porcentaje: 15,
      activo: true,
    });
    expect(await screen.findByText('15% llevando 3')).toBeInTheDocument();
  });

  it('edita y desactiva descuentos usando las operaciones del backend', async () => {
    let current = { ...descuento };
    let updateBody: unknown;
    const deleteRequests: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/descuentos' && config.method === 'get') {
        return response(config, { data: [current], total: 1 });
      }
      if (config.url === '/api/descuentos/8' && config.method === 'put') {
        updateBody = requestBody(config.data);
        current = { ...current, ...(updateBody as Partial<typeof current>) };
        return response(config, current);
      }
      if (config.url === '/api/descuentos/8' && config.method === 'delete') {
        deleteRequests.push(config.url);
        current = { ...current, activo: false };
        return response(config, null, 204);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderDescuentosPage();
    expect(await screen.findByText('10% llevando 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByLabelText('Porcentaje de descuento'), {
      target: { value: '12.5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Descuento actualizado correctamente.')).toBeInTheDocument();
    expect(updateBody).toMatchObject({ porcentaje: 12.5, activo: true });

    fireEvent.click(screen.getByRole('button', { name: 'Desactivar' }));
    expect(await screen.findByRole('button', { name: 'Activar' })).toBeInTheDocument();
    expect(deleteRequests).toEqual(['/api/descuentos/8']);
    expect(window.confirm).toHaveBeenCalledOnce();
  });

  it('reactiva un descuento enviando el payload completo, no solo activo', async () => {
    let current = { ...descuento, activo: false };
    let updateBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/descuentos' && config.method === 'get') {
        return response(config, { data: [current], total: 1 });
      }
      if (config.url === '/api/descuentos/8' && config.method === 'put') {
        updateBody = requestBody(config.data);
        current = { ...current, ...(updateBody as Partial<typeof current>) };
        return response(config, current);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderDescuentosPage();
    expect(await screen.findByText('10% llevando 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Activar' }));

    expect(await screen.findByText('Descuento activado correctamente.')).toBeInTheDocument();
    expect(updateBody).toEqual({
      descripcion: '10% llevando 2',
      cantidadMinima: 2,
      porcentaje: 10,
      activo: true,
    });
  });

  it('asocia y quita un producto con su ventana de vigencia', async () => {
    let aplicaciones: Array<{
      id: number;
      idDescuento: number;
      idProducto: number;
      fechaDesde: string;
      fechaHasta: string;
      producto: { id: number; nombre: string };
    }> = [];
    let applicationBody: unknown;
    const deleteRequests: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/descuentos' && config.method === 'get') {
        return response(config, { data: [descuento], total: 1 });
      }
      if (config.url === '/api/descuentos/8' && config.method === 'get') {
        return response(config, { ...descuento, aplicaciones });
      }
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        expect(config.params).toEqual({ activo: true, page: 1, size: 100 });
        return response(config, {
          data: [{ id: 21, nombre: 'Creatina', activo: true }],
          total: 1,
          page: 1,
          size: 100,
        });
      }
      if (config.url === '/api/descuentos/8/aplicaciones' && config.method === 'post') {
        applicationBody = requestBody(config.data);
        aplicaciones = [
          {
            id: 13,
            idDescuento: 8,
            idProducto: 21,
            fechaDesde: '2026-10-15T00:00:00.000Z',
            fechaHasta: '2026-10-31T00:00:00.000Z',
            producto: { id: 21, nombre: 'Creatina' },
          },
        ];
        return response(config, aplicaciones[0], 201);
      }
      if (config.url === '/api/descuentos/8/aplicaciones/13' && config.method === 'delete') {
        deleteRequests.push(config.url);
        aplicaciones = [];
        return response(config, null, 204);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderDescuentosPage();
    expect(await screen.findByText('10% llevando 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Aplicaciones' }));
    expect(await screen.findByRole('heading', { name: '10% llevando 2' })).toBeInTheDocument();
    fireEvent.change(await screen.findByLabelText('Producto activo'), {
      target: { value: '21' },
    });
    fireEvent.change(screen.getByLabelText('Vigente desde'), {
      target: { value: '2026-10-15' },
    });
    fireEvent.change(screen.getByLabelText('Vigente hasta'), {
      target: { value: '2026-10-31' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar descuento' }));

    expect(await screen.findByText('Creatina')).toBeInTheDocument();
    expect(applicationBody).toEqual({
      idProducto: 21,
      fechaDesde: '2026-10-15',
      fechaHasta: '2026-10-31',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Quitar' }));
    expect(await screen.findByText('Aplicación eliminada correctamente.')).toBeInTheDocument();
    expect(deleteRequests).toEqual(['/api/descuentos/8/aplicaciones/13']);
    expect(await screen.findByText(/todavía no está asociado/)).toBeInTheDocument();
  });

  it('muestra el conflicto de vigencia devuelto por la API', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/descuentos' && config.method === 'get') {
        return response(config, { data: [descuento], total: 1 });
      }
      if (config.url === '/api/descuentos/8' && config.method === 'get') {
        return response(config, { ...descuento, aplicaciones: [] });
      }
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        return response(config, {
          data: [{ id: 21, nombre: 'Creatina', activo: true }],
          total: 1,
          page: 1,
          size: 100,
        });
      }
      if (config.url === '/api/descuentos/8/aplicaciones' && config.method === 'post') {
        return Promise.reject({
          isAxiosError: true,
          config,
          response: {
            data: {
              statusCode: 409,
              message: 'Este descuento ya está aplicado a este producto con fechas solapadas',
            },
            status: 409,
            statusText: 'Conflict',
            headers: {},
          },
        });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderDescuentosPage();
    await screen.findByText('10% llevando 2');
    fireEvent.click(screen.getByRole('button', { name: 'Aplicaciones' }));
    await screen.findByLabelText('Producto activo');
    await screen.findByRole('option', { name: 'Creatina' });
    fireEvent.change(screen.getByLabelText('Producto activo'), { target: { value: '21' } });
    fireEvent.change(screen.getByLabelText('Vigente desde'), {
      target: { value: '2026-10-15' },
    });
    fireEvent.change(screen.getByLabelText('Vigente hasta'), {
      target: { value: '2026-10-31' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar descuento' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este descuento ya está aplicado a este producto con fechas solapadas',
    );
  });
});
