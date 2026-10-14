/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPedidosPage from '@/features/orders/pages/AdminPedidosPage';
import MisPedidosPage from '@/features/orders/pages/MisPedidosPage';
import { apiClient } from '@/core/api/api.client';
import { response } from '../helpers/axios-adapter';
import { saveSession } from '../helpers/session';

const adapterOriginal = apiClient.defaults.adapter;

const pedido = {
  id: 41,
  fecha: '2026-10-12T12:30:00.000Z',
  estado: 'REALIZADO' as const,
  importeTotal: '12500.00',
  usuario: {
    id: 7,
    nombre: 'Ana Cliente',
    email: 'ana@example.com',
    telefono: '1122334455',
    direccion: 'Calle 123',
  },
  createdAt: '2026-10-12T12:30:00.000Z',
  updatedAt: '2026-10-12T12:30:00.000Z',
  fechaEntrega: null,
};

const pedidoDetalle = {
  ...pedido,
  items: [
    {
      id: 9,
      producto: { id: 3, nombre: 'Proteína' },
      cantidad: 1,
      precioUnitario: '12500.00',
      subtotal: '12500.00',
      descuentoAplicado: null,
    },
  ],
};

function renderPage(path: string, element: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={element} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('consulta y gestión de pedidos', () => {
  beforeEach(() => {
    localStorage.clear();
    saveSession('ADMIN');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    apiClient.defaults.adapter = adapterOriginal;
    vi.restoreAllMocks();
  });

  it('filtra el listado admin, omite filtros vacíos y presenta el detalle del cliente', async () => {
    const requestedParams: Array<Record<string, unknown>> = [];
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/pedidos' && config.method === 'get') {
        requestedParams.push(config.params as Record<string, unknown>);
        return response(config, { data: [pedido], total: 1, page: 1, size: 20 });
      }
      if (config.url === '/api/pedidos/41' && config.method === 'get') {
        return response(config, pedidoDetalle);
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderPage('/admin/pedidos', <AdminPedidosPage />);
    expect(await screen.findByText('Ana Cliente')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-01' } });
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'REALIZADO' } });
    fireEvent.change(screen.getByLabelText('Nombre o email del cliente'), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));

    await waitFor(() => expect(requestedParams.length).toBeGreaterThanOrEqual(2));
    expect(requestedParams[requestedParams.length - 1]).toEqual({
      desde: '2026-10-01',
      hasta: undefined,
      estado: 'REALIZADO',
      cliente: 'ana@example.com',
      page: 1,
      size: 20,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));
    expect(await screen.findByText('Calle 123')).toBeInTheDocument();
    expect(screen.getByText('Proteína')).toBeInTheDocument();
  });

  it('entrega pedidos realizados y refleja la confirmación de la API', async () => {
    let currentStatus: 'REALIZADO' | 'ENTREGADO' = 'REALIZADO';
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/pedidos' && config.method === 'get') {
        return response(config, {
          data: [{ ...pedido, estado: currentStatus }],
          total: 1,
          page: 1,
          size: 20,
        });
      }
      if (config.url === '/api/pedidos/41/entregar' && config.method === 'post') {
        currentStatus = 'ENTREGADO';
        return response(config, { ...pedidoDetalle, estado: currentStatus });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderPage('/admin/pedidos', <AdminPedidosPage />);
    expect(await screen.findByRole('button', { name: 'Entregar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Entregar' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'El pedido #41 se marcó como entregado.',
    );
    await waitFor(() => expect(screen.getByText('ENTREGADO')).toBeInTheDocument());
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });

  it('cancela pedidos realizados con confirmación e informa la transición exitosa', async () => {
    let currentStatus: 'REALIZADO' | 'CANCELADO' = 'REALIZADO';
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/pedidos' && config.method === 'get') {
        return response(config, {
          data: [{ ...pedido, estado: currentStatus }],
          total: 1,
          page: 1,
          size: 20,
        });
      }
      if (config.url === '/api/pedidos/41/cancelar' && config.method === 'post') {
        currentStatus = 'CANCELADO';
        return response(config, { ...pedidoDetalle, estado: currentStatus });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderPage('/admin/pedidos', <AdminPedidosPage />);
    expect(await screen.findByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'El pedido #41 se canceló correctamente.',
    );
    await waitFor(() => expect(screen.getByText('CANCELADO')).toBeInTheDocument());
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Entregar' })).not.toBeInTheDocument();
  });

  it('presenta el error de negocio de la API al intentar cancelar un pedido', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/pedidos' && config.method === 'get') {
        return response(config, { data: [pedido], total: 1, page: 1, size: 20 });
      }
      if (config.url === '/api/pedidos/41/cancelar' && config.method === 'post') {
        return Promise.reject({
          isAxiosError: true,
          config,
          response: {
            data: { statusCode: 409, message: 'El pedido no se puede cancelar' },
            status: 409,
            statusText: 'Conflict',
            headers: {},
          },
        });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderPage('/admin/pedidos', <AdminPedidosPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El pedido no se puede cancelar');
    expect(screen.getByRole('button', { name: 'Entregar' })).toBeInTheDocument();
  });

  it('permite al cliente consultar sus pedidos y abrir el detalle propio', async () => {
    localStorage.clear();
    saveSession('CLIENTE');
    const paths: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      paths.push(config.url ?? '');
      if (config.url === '/api/mis-pedidos' && config.method === 'get') {
        return response(config, { data: [pedido], total: 1 });
      }
      if (config.url === '/api/mis-pedidos/41' && config.method === 'get') {
        return response(config, {
          ...pedidoDetalle,
          usuario: { id: 7, nombre: 'Ana Cliente', email: 'ana@example.com' },
        });
      }
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderPage('/mis-pedidos', <MisPedidosPage />);
    expect(await screen.findByRole('button', { name: 'Ver detalle' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver detalle' }));

    expect(await screen.findByText('Proteína')).toBeInTheDocument();
    expect(paths).toContain('/api/mis-pedidos/41');
  });
});
