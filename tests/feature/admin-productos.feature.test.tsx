/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { InternalAxiosRequestConfig } from 'axios';
import { hang, response, requestBody } from '../helpers/axios-adapter';
import { saveSession } from '../helpers/session';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import AdminProductosPage from '@/features/admin/pages/AdminProductosPage';

const adapterOriginal = apiClient.defaults.adapter;
const scrollIntoViewOriginal = Element.prototype.scrollIntoView;

function formProducto() {
  return within(screen.getByRole('form', { name: 'Formulario de producto' }));
}

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
    Element.prototype.scrollIntoView = scrollIntoViewOriginal;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('envía filtros administrativos y paginación soportados por el backend', async () => {
    saveSession('ADMIN');
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
    saveSession('ADMIN');
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
    fireEvent.change(formProducto().getByLabelText('Marca'), { target: { value: '2' } });
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

  it('lleva el formulario a la vista y lo enfoca al pulsar Editar', async () => {
    saveSession('ADMIN');
    apiClient.defaults.adapter = async (config) => {
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        return response(config, { data: [producto], total: 1, page: 1, size: 20 });
      }
      if (config.url === '/api/productos/admin/21' && config.method === 'get') {
        return response(config, producto);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;

    renderProductosPage();
    expect(await screen.findByText('Proteína de suero')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    const form = screen.getByRole('form', { name: 'Formulario de producto' });
    await waitFor(() => expect(scrollSpy).toHaveBeenCalled());
    expect(scrollSpy.mock.contexts[0]).toBe(form);
    await waitFor(() => expect(form).toHaveFocus());
  });

  it('edita datos y relaciones sin incluir campos de stock en el request', async () => {
    saveSession('ADMIN');
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
    fireEvent.change(formProducto().getByLabelText('Marca'), { target: { value: '2' } });
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
    saveSession('ADMIN');
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
    expect(formProducto().getByLabelText('Marca')).toContainElement(
      formProducto().getByRole('option', { name: 'Star Nutrition' }),
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
    saveSession('ADMIN');
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
    saveSession('ADMIN');
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
    saveSession('ADMIN');
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
    fireEvent.change(formProducto().getByLabelText('Marca'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La marca seleccionada no existe o está inactiva',
    );
    expect(screen.queryByText('Producto creado correctamente.')).not.toBeInTheDocument();
  });

  it('muestra el error del listado y Reintentar vuelve a consultar', async () => {
    saveSession('ADMIN');
    let listCalls = 0;
    apiClient.defaults.adapter = async (config) => {
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        listCalls += 1;
        if (listCalls === 1) {
          return Promise.reject({
            isAxiosError: true,
            config,
            response: {
              data: { statusCode: 503, message: 'Servicio temporalmente no disponible' },
              status: 503,
              statusText: 'Service Unavailable',
              headers: {},
            },
          });
        }
        return response(config, { data: [producto], total: 1, page: 1, size: 20 });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderProductosPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo cargar el listado: Servicio temporalmente no disponible',
    );
    expect(listCalls).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Proteína de suero')).toBeInTheDocument();
    expect(listCalls).toBe(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('pagina con Anterior/Siguiente y pide la página elegida al backend', async () => {
    saveSession('ADMIN');
    const requests: Array<{ params?: unknown }> = [];
    apiClient.defaults.adapter = async (config) => {
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        requests.push({ params: config.params });
        const page = Number(config.params?.page ?? 1);
        return response(config, { data: [producto], total: 40, page, size: 20 });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderProductosPage();
    await screen.findByText('Proteína de suero');

    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() => expect(requests[requests.length - 1]?.params).toMatchObject({ page: 2 }));
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));

    await waitFor(() => expect(requests[requests.length - 1]?.params).toMatchObject({ page: 1 }));
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
  });

  it('envía los ids nuevos de tipo y proveedor al editar las relaciones', async () => {
    saveSession('ADMIN');
    let updateBody: Record<string, unknown> | undefined;
    const tiposEdit = [
      ...tipos,
      { id: 7, nombre: 'Barras', descripcion: null, activo: true, createdAt: '', updatedAt: '' },
    ];
    const proveedoresEdit = [
      ...proveedores,
      {
        id: 9,
        razonSocial: 'Distribuidora Sur',
        cuit: '20709876543',
        telefono: null,
        email: null,
        domicilio: null,
        activo: true,
        createdAt: '',
        updatedAt: '',
      },
    ];
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/marcas') {
        return response(config, { data: marcas, total: marcas.length });
      }
      if (config.url === '/api/tipos-producto') {
        return response(config, { data: tiposEdit, total: tiposEdit.length });
      }
      if (config.url === '/api/proveedores') {
        return response(config, { data: proveedoresEdit, total: proveedoresEdit.length });
      }
      if (config.url === '/api/productos/admin' && config.method === 'get') {
        return response(config, { data: [producto], total: 1, page: 1, size: 20 });
      }
      if (config.url === '/api/productos/admin/21' && config.method === 'get') {
        return response(config, producto);
      }
      if (config.url === '/api/productos/admin/21' && config.method === 'put') {
        updateBody = requestBody(config.data) as Record<string, unknown>;
        return response(config, { ...producto, ...updateBody });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderProductosPage();
    await screen.findByText('Proteína de suero');
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    fireEvent.change(formProducto().getByLabelText('Tipo de producto'), {
      target: { value: '7' },
    });
    fireEvent.change(formProducto().getByLabelText('Proveedor (opcional)'), {
      target: { value: '9' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(updateBody).toBeDefined());
    expect(updateBody).toMatchObject({ idTipoProducto: 7, idProveedor: 9 });
    expect(updateBody).not.toHaveProperty('idMarca');
    expect(updateBody).not.toHaveProperty('stock');
  });

  it('muestra el estado de carga mientras el listado admin no responde', async () => {
    saveSession('ADMIN');
    apiClient.defaults.adapter = async (config) => {
      const masterResponse = masterDataResponse(config);
      if (masterResponse) return masterResponse;
      return hang();
    };

    renderProductosPage();

    expect(await screen.findByRole('status')).toHaveTextContent('Cargando productos...');
  });
});
