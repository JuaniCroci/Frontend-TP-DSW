/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiClient } from '@/core/api/api.client';
import CatalogoPage from '@/features/products/pages/CatalogoPage';
import ProductoDetallePage from '@/features/products/pages/ProductoDetallePage';

const adapterOriginal = apiClient.defaults.adapter;

const productoLista = {
  id: 7,
  nombre: 'Proteína de suero',
  marca: { id: 2, nombre: 'Entreno Nutrition' },
  precioUnitario: '12500.00',
  disponible: true,
};

const productoDetalle = {
  ...productoLista,
  descripcion: 'Proteína para acompañar la recuperación.',
  stock: 8,
  activo: true,
  tipoProducto: { id: 3, nombre: 'Suplementos' },
  proveedor: null,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-02T12:00:00.000Z',
  descuentosVigentes: [
    {
      id: 4,
      descripcion: 'Descuento por cantidad',
      cantidadMinima: 2,
      porcentaje: 10,
      activo: true,
      createdAt: '2026-10-01T12:00:00.000Z',
      updatedAt: '2026-10-02T12:00:00.000Z',
    },
  ],
};

function ok(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config,
  };
}

function renderRoutes(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/productos" element={<CatalogoPage />} />
          <Route path="/productos/:id" element={<ProductoDetallePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('catálogo de productos', () => {
  afterEach(() => {
    cleanup();
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('envía filtros y paginación y presenta los productos recibidos', async () => {
    const productRequests: Array<{ params?: Record<string, unknown> }> = [];
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/productos') {
        productRequests.push(config);
        const page = Number(config.params?.page ?? 1);
        return ok(config, {
          data: page === 1 ? [productoLista] : [],
          total: 13,
          page,
          size: 12,
        });
      }
      if (config.url === '/api/marcas') return ok(config, { data: [], total: 0 });
      if (config.url === '/api/tipos-producto') return ok(config, { data: [], total: 0 });
      throw new Error(`Request inesperado: ${config.url}`);
    };

    renderRoutes('/productos?idMarca=2&precioMin=1000');

    expect(await screen.findByRole('heading', { name: 'Proteína de suero' })).toBeInTheDocument();
    expect(screen.getByText('Entreno Nutrition')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('12.500,00'))).toBeInTheDocument();
    expect(productRequests[0].params).toMatchObject({
      idMarca: 2,
      precioMin: 1000,
      page: 1,
      size: 12,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() => expect(productRequests).toHaveLength(2));
    expect(productRequests[1].params).toMatchObject({ idMarca: 2, precioMin: 1000, page: 2 });
  });

  it('muestra un estado vacío cuando la API no devuelve productos', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/productos')
        return ok(config, { data: [], total: 0, page: 1, size: 12 });
      if (config.url === '/api/marcas') return ok(config, { data: [], total: 0 });
      return ok(config, { data: [], total: 0 });
    };

    renderRoutes('/productos');

    expect(
      await screen.findByRole('heading', { name: 'Todavía no hay productos disponibles' }),
    ).toBeInTheDocument();
  });

  it('aplica filtros seleccionados desde el formulario', async () => {
    let lastProductRequest: InternalAxiosRequestConfig | undefined;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/productos') {
        lastProductRequest = config;
        return ok(config, { data: [], total: 0, page: 1, size: 12 });
      }
      if (config.url === '/api/marcas') {
        return ok(config, {
          data: [{ id: 2, nombre: 'Entreno Nutrition', activo: true }],
          total: 1,
        });
      }
      return ok(config, {
        data: [{ id: 3, nombre: 'Suplementos', activo: true }],
        total: 1,
      });
    };

    renderRoutes('/productos');
    await screen.findByRole('heading', { name: 'Todavía no hay productos disponibles' });

    fireEvent.change(screen.getByLabelText('Tipo de producto'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Marca'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Precio mínimo'), { target: { value: '1500' } });
    fireEvent.change(screen.getByLabelText('Precio máximo'), { target: { value: '9000' } });
    fireEvent.change(screen.getByLabelText('Ordenar por'), { target: { value: 'precio' } });
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'desc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    await waitFor(() =>
      expect(lastProductRequest?.params).toMatchObject({
        idTipoProducto: 3,
        idMarca: 2,
        precioMin: 1500,
        precioMax: 9000,
        orden: 'precio',
        dir: 'desc',
        page: 1,
      }),
    );
  });

  it('informa errores de la API del catálogo', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/productos') {
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
      return ok(config, { data: [], total: 0 });
    };

    renderRoutes('/productos');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Servicio temporalmente no disponible',
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('muestra detalle, descuentos vigentes y conserva los filtros al volver', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/productos/7') return ok(config, productoDetalle);
      throw new Error(`Request inesperado: ${config.url}`);
    };

    renderRoutes('/productos/7?idMarca=2&precioMin=1000');

    expect(await screen.findByRole('heading', { name: 'Proteína de suero' })).toBeInTheDocument();
    expect(screen.getByText('8 unidades disponibles')).toBeInTheDocument();
    expect(screen.getByText(/Descuento por cantidad/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Volver al catálogo' })).toHaveAttribute(
      'href',
      '/productos?idMarca=2&precioMin=1000',
    );
  });
});
