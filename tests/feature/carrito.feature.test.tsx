/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { hang, response } from '../helpers/axios-adapter';
import { saveSession } from '../helpers/session';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import { AuthContext, type AuthContextValue } from '@/core/auth/AuthContext';
import CarritoPage from '@/features/cart/pages/CarritoPage';

const adapterOriginal = apiClient.defaults.adapter;

const activeCart = {
  id: 4,
  estado: 'ACTIVO' as const,
  items: [
    {
      id: 12,
      producto: { id: 21, nombre: 'Creatina', precioUnitario: '30000.00' },
      cantidad: 2,
      subtotal: '60000.00',
    },
  ],
  total: '60000.00',
};

const confirmedOrder = {
  id: 81,
  fecha: '2026-10-12T12:00:00.000Z',
  estado: 'REALIZADO' as const,
  importeTotal: '54000.00',
  usuario: { id: 1, nombre: 'Cliente', email: 'cliente@example.test' },
  items: [
    {
      id: 33,
      producto: { id: 21, nombre: 'Creatina' },
      cantidad: 2,
      precioUnitario: '30000.00',
      subtotal: '54000.00',
      descuentoAplicado: '10.00',
    },
  ],
};

const clientContext: AuthContextValue = {
  user: { id: 1, nombre: 'Cliente', email: 'cliente@example.test', rol: 'CLIENTE' },
  token: 'token-de-prueba',
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
};

function renderCart() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={clientContext}>
        <MemoryRouter initialEntries={['/carrito']}>
          <Routes>
            <Route path="/carrito" element={<CarritoPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('carrito de compras', () => {
  beforeEach(() => {
    localStorage.clear();
    saveSession('CLIENTE');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    apiClient.defaults.adapter = adapterOriginal;
    vi.restoreAllMocks();
  });

  it('muestra los importes del servidor, actualiza cantidades y quita productos', async () => {
    let cart = structuredClone(activeCart);
    let updateBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/carrito' && config.method === 'get') {
        return response(config, cart);
      }
      if (config.url === '/api/carrito/items/12' && config.method === 'put') {
        updateBody = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        const cantidad = (updateBody as { cantidad: number }).cantidad;
        if (cantidad > 100) {
          return Promise.reject({
            isAxiosError: true,
            config,
            response: {
              data: {
                statusCode: 409,
                message: 'La cantidad en carrito supera el stock disponible',
              },
              status: 409,
              statusText: 'Conflict',
              headers: {},
            },
          });
        }
        cart = {
          ...cart,
          items: [{ ...cart.items[0], cantidad, subtotal: `${(cantidad * 30000).toFixed(2)}` }],
          total: `${(cantidad * 30000).toFixed(2)}`,
        };
        return response(config, cart);
      }
      if (config.url === '/api/carrito/items/12' && config.method === 'delete') {
        cart = { ...cart, items: [], total: '0.00' };
        return response(config, null, 204);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderCart();
    expect(await screen.findByText('Creatina')).toBeInTheDocument();
    expect(screen.getByText(/Total:.*60\.000,00/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Cantidad de Creatina'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => expect(updateBody).toEqual({ cantidad: 3 }));
    expect(await screen.findByText(/Total:.*90\.000,00/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Cantidad de Creatina'), {
      target: { value: '999' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La cantidad en carrito supera el stock disponible',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Quitar' }));
    expect(
      await screen.findByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledOnce();
  });

  it('confirma el carrito y presenta el pedido, sus descuentos y la aclaración de pago', async () => {
    let confirmationRequests = 0;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/carrito' && config.method === 'get') {
        return response(
          config,
          confirmationRequests ? null : activeCart,
          confirmationRequests ? 404 : 200,
        );
      }
      if (config.url === '/api/carrito/confirmar' && config.method === 'post') {
        confirmationRequests += 1;
        return response(config, confirmedOrder);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderCart();
    await screen.findByText('Creatina');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    expect(await screen.findByRole('heading', { name: 'Pedido confirmado' })).toBeInTheDocument();
    expect(screen.getByText('#81')).toBeInTheDocument();
    expect(screen.getAllByText(/54\.000,00/)).toHaveLength(2);
    expect(screen.getByText('(10.00% de descuento)')).toBeInTheDocument();
    expect(screen.getByText(/todavía no se realizó ningún pago/)).toBeInTheDocument();
    expect(confirmationRequests).toBe(1);
    expect(window.confirm).toHaveBeenCalledWith(
      'Se confirmará el pedido. El pago no se procesa en esta etapa.',
    );
  });

  it('no presenta descuento cuando el backend informa 0.00 o null', async () => {
    const orderSinDescuento = {
      ...confirmedOrder,
      importeTotal: '60000.00',
      items: [
        { ...confirmedOrder.items[0], subtotal: '60000.00', descuentoAplicado: '0.00' },
        {
          ...confirmedOrder.items[0],
          id: 34,
          producto: { id: 22, nombre: 'Proteína' },
          descuentoAplicado: null,
        },
      ],
    };
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/carrito' && config.method === 'get') {
        return response(config, activeCart);
      }
      if (config.url === '/api/carrito/confirmar' && config.method === 'post') {
        return response(config, orderSinDescuento);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderCart();
    await screen.findByText('Creatina');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    expect(await screen.findByRole('heading', { name: 'Pedido confirmado' })).toBeInTheDocument();
    expect(screen.queryByText(/de descuento/)).not.toBeInTheDocument();
  });

  it('presenta un carrito inexistente como estado vacío y no oculta otros errores', async () => {
    apiClient.defaults.adapter = async (config) =>
      Promise.reject({
        isAxiosError: true,
        config,
        response: {
          data: { statusCode: 404, message: 'No hay carrito activo para el usuario' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
        },
      });

    renderCart();

    expect(
      await screen.findByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('presenta el mensaje del servidor cuando la confirmación falla con 400', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/carrito' && config.method === 'get') {
        return response(config, activeCart);
      }
      if (config.url === '/api/carrito/confirmar' && config.method === 'post') {
        return Promise.reject({
          isAxiosError: true,
          config,
          response: {
            data: { statusCode: 400, message: 'El carrito está vacío' },
            status: 400,
            statusText: 'Bad Request',
            headers: {},
          },
        });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderCart();
    await screen.findByText('Creatina');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El carrito está vacío');
    expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeEnabled();
    expect(
      screen.queryByRole('heading', { name: 'Pedido confirmado' }),
    ).not.toBeInTheDocument();
  });

  it('muestra el estado de carga mientras el carrito no responde', async () => {
    apiClient.defaults.adapter = () => hang();

    renderCart();

    expect(await screen.findByRole('status')).toHaveTextContent('Cargando carrito...');
  });
});
