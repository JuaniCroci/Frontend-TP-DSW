/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import { AuthContext, type AuthContextValue } from '@/core/auth/AuthContext';
import ProductoDetallePage from '@/features/products/pages/ProductoDetallePage';
import { hang, requestBody, response } from '../helpers/axios-adapter';

const adapterOriginal = apiClient.defaults.adapter;

const producto = {
  id: 8,
  nombre: 'Creatina monohidratada',
  marca: { id: 2, nombre: 'Star Nutrition' },
  precioUnitario: '30000.00',
  disponible: true,
  imagenPrincipal: null,
  descripcion: 'Creatina en polvo.',
  stock: 5,
  activo: true,
  tipoProducto: { id: 3, nombre: 'Suplementos' },
  proveedor: null,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-02T12:00:00.000Z',
  descuentosVigentes: [],
};

const carritoPosteado = {
  id: 4,
  estado: 'ACTIVO' as const,
  items: [
    {
      id: 12,
      producto: { id: 8, nombre: 'Creatina monohidratada', precioUnitario: '30000.00' },
      cantidad: 3,
      subtotal: '90000.00',
    },
  ],
  total: '90000.00',
};

const clienteContext: AuthContextValue = {
  user: { id: 1, nombre: 'Cliente', email: 'cliente@entreno.test', rol: 'CLIENTE' },
  token: 'token-de-prueba',
  isAuthenticated: true,
  login: async () => {},
  logout: async () => {},
};

function renderDetalle() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={clienteContext}>
        <MemoryRouter initialEntries={['/productos/8']}>
          <Routes>
            <Route path="/productos/:id" element={<ProductoDetallePage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

function mockDetalleOk() {
  apiClient.defaults.adapter = async (config) => {
    if (config.url === '/api/productos/8' && config.method === 'get') {
      return response(config, producto);
    }
    throw new Error(`Request inesperado: ${config.method} ${config.url}`);
  };
}

describe('agregar al carrito desde el detalle de producto', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('envía {idProducto, cantidad} al servidor y confirma en pantalla', async () => {
    let postBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/productos/8' && config.method === 'get') {
        return response(config, producto);
      }
      if (config.url === '/api/carrito/items' && config.method === 'post') {
        postBody = requestBody(config.data);
        return response(config, carritoPosteado, 201);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderDetalle();

    expect(await screen.findByRole('heading', { name: 'Creatina monohidratada' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }));

    await waitFor(() => expect(postBody).toEqual({ idProducto: 8, cantidad: 3 }));
    expect(await screen.findByText('Producto agregado al carrito.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver carrito' })).toHaveAttribute('href', '/carrito');
  });

  it('envía cantidad 1 cuando no se eligió otra', async () => {
    let postBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/productos/8' && config.method === 'get') {
        return response(config, producto);
      }
      if (config.url === '/api/carrito/items' && config.method === 'post') {
        postBody = requestBody(config.data);
        return response(config, carritoPosteado, 201);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderDetalle();

    expect(await screen.findByRole('heading', { name: 'Creatina monohidratada' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }));

    await waitFor(() => expect(postBody).toEqual({ idProducto: 8, cantidad: 1 }));
  });

  it('muestra el conflicto de stock (409) sin confirmar la alta', async () => {
    mockDetalleOk();
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/productos/8' && config.method === 'get') {
        return response(config, producto);
      }
      if (config.url === '/api/carrito/items' && config.method === 'post') {
        return Promise.reject({
          isAxiosError: true,
          config,
          response: {
            data: {
              statusCode: 409,
              message: 'No hay stock suficiente para la cantidad elegida',
            },
            status: 409,
            statusText: 'Conflict',
            headers: {},
          },
        });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderDetalle();

    expect(await screen.findByRole('heading', { name: 'Creatina monohidratada' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No hay stock suficiente para la cantidad elegida',
    );
    expect(screen.queryByText('Producto agregado al carrito.')).not.toBeInTheDocument();
  });

  it('presenta el error del backend cuando el producto no existe (404)', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/productos/8' && config.method === 'get') {
        return Promise.reject({
          isAxiosError: true,
          config,
          response: {
            data: { statusCode: 404, message: 'Producto no encontrado' },
            status: 404,
            statusText: 'Not Found',
            headers: {},
          },
        });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderDetalle();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos cargar este producto.',
    );
    expect(screen.getByText('Producto no encontrado')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Agregar al carrito' }),
    ).not.toBeInTheDocument();
  });

  it('muestra el estado de carga mientras el producto no responde', async () => {
    apiClient.defaults.adapter = () => hang();

    renderDetalle();

    expect(await screen.findByRole('status')).toHaveTextContent('Cargando producto...');
  });
});
