/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import AdminProductosPage from '@/features/admin/pages/AdminProductosPage';

const adapterOriginal = apiClient.defaults.adapter;

const producto = {
  id: 21,
  nombre: 'Proteína de suero',
  descripcion: 'Presentación de vainilla',
  precioUnitario: '12500.00',
  stock: 8,
  activo: true,
  tipoProducto: { id: 3, nombre: 'Suplemento' },
  marca: { id: 2, nombre: 'Star Nutrition' },
  proveedor: { id: 4, razonSocial: 'Distribuidora Norte', activo: true },
  imagenPrincipal: null,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-02T12:00:00.000Z',
};

const marcas = [{ id: 2, nombre: 'Star Nutrition', activo: true, createdAt: '', updatedAt: '' }];
const tipos = [
  {
    id: 3,
    nombre: 'Suplemento',
    descripcion: null,
    activo: true,
    createdAt: '',
    updatedAt: '',
  },
];
const proveedores = [
  {
    id: 4,
    razonSocial: 'Distribuidora Norte',
    cuit: '20301234567',
    telefono: null,
    email: null,
    domicilio: null,
    activo: true,
    createdAt: '',
    updatedAt: '',
  },
];

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

function renderProductosPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/productos']}>
        <Routes>
          <Route path="/admin/productos" element={<AdminProductosPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function masterDataResponse(config: InternalAxiosRequestConfig) {
  if (config.url === '/api/marcas') return response(config, { data: marcas, total: marcas.length });
  if (config.url === '/api/tipos-producto')
    return response(config, { data: tipos, total: tipos.length });
  if (config.url === '/api/proveedores')
    return response(config, { data: proveedores, total: proveedores.length });
  return null;
}

describe('administración de productos', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    apiClient.defaults.adapter = adapterOriginal;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('envía filtros administrativos y paginación soportados por el backend', async () => {
    saveAdminSession();
    const requests: Array<{ params?: unknown }> = [];
    apiClient.defaults.adapter = async (config) => {
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        requests.push({ params: config.params });
        return response(config, { data: [], total: 0, page: 1, size: 20 });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderProductosPage();
    await screen.findByText('No hay productos para estos filtros.');
    fireEvent.change(screen.getByLabelText('Buscar por nombre'), {
      target: { value: 'proteína' },
    });
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Marca'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Proveedor'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'inactivos' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    await waitFor(() =>
      expect(requests[requests.length - 1]?.params).toEqual({
        page: 1,
        size: 20,
        nombre: 'proteína',
        idTipoProducto: 3,
        idMarca: 2,
        idProveedor: 4,
        inactivos: true,
      }),
    );
  });

  it('crea con relaciones activas y stockInicial sin enviar stock', async () => {
    saveAdminSession();
    let createBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        return response(config, { data: [], total: 0, page: 1, size: 20 });
      }
      if (config.url === '/api/productos' && config.method === 'post') {
        createBody = requestBody(config.data);
        return response(config, { ...producto, ...(createBody as object) }, 201);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderProductosPage();
    await screen.findByText('No hay productos para estos filtros.');
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Proteína de suero' } });
    fireEvent.change(screen.getByLabelText('Precio unitario'), { target: { value: '12500.00' } });
    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Presentación de vainilla' },
    });
    fireEvent.change(screen.getByLabelText('Stock inicial'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Tipo de producto'), { target: { value: '3' } });
    fireEvent.change(screen.getAllByLabelText('Marca')[0], { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Proveedor (opcional)'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));

    expect(await screen.findByText('Producto creado correctamente.')).toBeInTheDocument();
    expect(createBody).toEqual({
      nombre: 'Proteína de suero',
      descripcion: 'Presentación de vainilla',
      precioUnitario: '12500.00',
      stockInicial: 8,
      idTipoProducto: 3,
      idMarca: 2,
      idProveedor: 4,
    });
    expect(createBody).not.toHaveProperty('stock');
  });

  it('edita datos y relaciones sin incluir campos de stock en el request', async () => {
    saveAdminSession();
    let updateBody: Record<string, unknown> | undefined;
    let currentProducto = producto;
    apiClient.defaults.adapter = async (config) => {
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        return response(config, {
          data: [currentProducto],
          total: 1,
          page: 1,
          size: 20,
        });
      }
      if (config.url === '/api/productos/admin/21' && config.method === 'get') {
        return response(config, currentProducto);
      }
      if (config.url === '/api/productos/admin/21' && config.method === 'put') {
        updateBody = requestBody(config.data) as Record<string, unknown>;
        currentProducto = { ...currentProducto, ...updateBody };
        return response(config, currentProducto);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderProductosPage();
    expect(await screen.findByText('Proteína de suero')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByText((text) => text.startsWith('Stock actual:'))).toHaveTextContent('8');
    expect(screen.queryByLabelText('Stock inicial')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Precio unitario'), { target: { value: '13000.00' } });
    fireEvent.change(screen.getAllByLabelText('Marca')[0], { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Producto actualizado correctamente.')).toBeInTheDocument();
    expect(updateBody).toEqual({
      nombre: 'Proteína de suero',
      descripcion: 'Presentación de vainilla',
      precioUnitario: '13000.00',
    });
    expect(updateBody).not.toHaveProperty('stock');
    expect(updateBody).not.toHaveProperty('stockInicial');
  });

  it('muestra únicamente relaciones activas y permite limpiar proveedor opcional', async () => {
    saveAdminSession();
    let updateBody: Record<string, unknown> | undefined;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/marcas') {
        return response(config, {
          data: [
            ...marcas,
            { id: 5, nombre: 'Marca inactiva', activo: false, createdAt: '', updatedAt: '' },
          ],
          total: 2,
        });
      }
      if (config.url === '/api/tipos-producto') {
        return response(config, {
          data: [
            ...tipos,
            {
              id: 6,
              nombre: 'Tipo inactivo',
              descripcion: null,
              activo: false,
              createdAt: '',
              updatedAt: '',
            },
          ],
          total: 2,
        });
      }
      if (config.url === '/api/proveedores') {
        return response(config, {
          data: [
            ...proveedores,
            {
              ...proveedores[0],
              id: 7,
              razonSocial: 'Proveedor inactivo',
              activo: false,
            },
          ],
          total: 2,
        });
      }
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        return response(config, { data: [producto], total: 1, page: 1, size: 20 });
      }
      if (config.url === '/api/productos/admin/21' && config.method === 'put') {
        updateBody = requestBody(config.data) as Record<string, unknown>;
        return response(config, producto);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderProductosPage();
    await screen.findByText('Proteína de suero');
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getAllByLabelText('Marca')[0]).toContainElement(
      screen.getAllByRole('option', { name: 'Star Nutrition' })[0],
    );
    expect(screen.queryByRole('option', { name: 'Marca inactiva' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Tipo inactivo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Proveedor inactivo' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Proveedor (opcional)'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Producto actualizado correctamente.')).toBeInTheDocument();
    expect(updateBody).toMatchObject({ idProveedor: 0 });
    expect(updateBody).not.toHaveProperty('stock');
  });

  it('confirma baja lógica y reporta el éxito después de la respuesta del servidor', async () => {
    saveAdminSession();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    let currentProducto = producto;
    apiClient.defaults.adapter = async (config) => {
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        return response(config, { data: [currentProducto], total: 1, page: 1, size: 20 });
      }
      if (config.url === '/api/productos/admin/21' && config.method === 'delete') {
        currentProducto = { ...currentProducto, activo: false };
        return response(config, null, 204);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderProductosPage();
    await screen.findByText('Proteína de suero');
    fireEvent.click(screen.getByRole('button', { name: 'Desactivar' }));

    expect(await screen.findByText('Producto desactivado correctamente.')).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledWith(
      '¿Desactivar "Proteína de suero"? Esta acción no se puede deshacer desde aquí.',
    );
  });

  it('carga y registra una imagen con metadatos desde la gestión del producto', async () => {
    saveAdminSession();
    let sentFormData: FormData | undefined;
    apiClient.defaults.adapter = async (config) => {
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        return response(config, { data: [producto], total: 1, page: 1, size: 20 });
      }
      if (config.url === '/api/productos/admin/21/imagenes' && config.method === 'get') {
        return response(config, { data: [] });
      }
      if (config.url === '/api/productos/admin/21/imagenes' && config.method === 'post') {
        sentFormData = config.data as FormData;
        return response(
          config,
          {
            id: '2d4fcba2-a86c-4ca1-a127-28bd24bf0a58',
            url: '/api/productos/imagenes/2d4fcba2-a86c-4ca1-a127-28bd24bf0a58',
            altText: 'Creatina Star Nutrition',
            fuente: 'Fotografía propia',
            licencia: 'Uso académico; permiso de marca pendiente',
            atribucion: null,
            mimeType: 'image/png',
            sizeBytes: 100,
            esPrincipal: true,
            createdAt: '2026-10-11T19:00:00.000Z',
          },
          201,
        );
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderProductosPage();
    await screen.findByText('Proteína de suero');
    fireEvent.click(screen.getByRole('button', { name: 'Imágenes' }));
    await screen.findByText('Todavía no hay imágenes registradas.');
    fireEvent.change(screen.getByLabelText(/^Archivo de imagen/), {
      target: { files: [new File(['image'], 'creatina.png', { type: 'image/png' })] },
    });
    fireEvent.change(screen.getByLabelText('Texto alternativo'), {
      target: { value: 'Creatina Star Nutrition' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cargar imagen' }));

    expect(
      await screen.findByText('Imagen cargada y establecida como principal.'),
    ).toBeInTheDocument();
    expect(sentFormData?.get('imagen')).toBeInstanceOf(File);
    expect((sentFormData?.get('imagen') as File).name).toBe('creatina.png');
    expect(sentFormData?.get('altText')).toBe('Creatina Star Nutrition');
    expect(sentFormData?.get('fuente')).toBe('Fotografía propia');
    expect(sentFormData?.get('licencia')).toBe(
      'Fotografía propia para uso académico; autorización de marca pendiente.',
    );
  });

  it('muestra los errores de dependencia que devuelve el servidor al crear', async () => {
    saveAdminSession();
    apiClient.defaults.adapter = async (config) => {
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        return response(config, { data: [], total: 0, page: 1, size: 20 });
      }
      return Promise.reject({
        isAxiosError: true,
        config,
        response: {
          data: {
            statusCode: 404,
            message: 'La marca seleccionada no existe o está inactiva',
          },
          status: 404,
          statusText: 'Not Found',
          headers: {},
        },
      });
    };

    renderProductosPage();
    await screen.findByText('No hay productos para estos filtros.');
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Producto nuevo' } });
    fireEvent.change(screen.getByLabelText('Precio unitario'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Stock inicial'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Tipo de producto'), { target: { value: '3' } });
    fireEvent.change(screen.getAllByLabelText('Marca')[0], { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La marca seleccionada no existe o está inactiva',
    );
    expect(screen.queryByText('Producto creado correctamente.')).not.toBeInTheDocument();
  });
});
