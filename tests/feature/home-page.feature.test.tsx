/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import { AuthProvider } from '@/core/auth/AuthProvider';
import HomePage from '@/features/home/pages/HomePage';
import { MainLayout } from '@/shared/layout/MainLayout';
import { saveSession } from '../helpers/session';

const adapterOriginal = apiClient.defaults.adapter;
const scrollIntoViewSpy = vi.fn();

const tipos = [
  {
    id: 3,
    nombre: 'Suplementos',
    descripcion: 'Proteínas y pre-entrenos.',
    activo: true,
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
  },
  {
    id: 7,
    nombre: 'Accesorios',
    descripcion: null,
    activo: true,
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
  },
];

function renderHomePage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('home page', () => {
  beforeEach(() => {
    localStorage.clear();
    scrollIntoViewSpy.mockReset();
    Element.prototype.scrollIntoView = scrollIntoViewSpy;
    apiClient.defaults.adapter = async (config) => ({
      data:
        config.url === '/api/tipos-producto'
          ? { data: tipos, total: tipos.length }
          : { data: [], total: 0 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  });

  afterEach(() => {
    cleanup();
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('oculta el botón "Iniciar sesión" del hero con una sesión iniciada', async () => {
    saveSession('CLIENTE');

    renderHomePage();

    expect(
      await screen.findByRole('heading', { name: 'Tu próximo objetivo empieza acá.' }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('main')).queryByRole('link', { name: 'Iniciar sesión' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toBeInTheDocument();
  });

  it('muestra el botón "Iniciar sesión" del hero para visitantes', async () => {
    renderHomePage();

    expect(
      await screen.findByRole('heading', { name: 'Tu próximo objetivo empieza acá.' }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('main')).getByRole('link', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument();
  });

  it('desplaza la vista a la sección de categorías cuando el link lleva el hash', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 0 } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/#categorias']}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(scrollIntoViewSpy).toHaveBeenCalled());
    expect(scrollIntoViewSpy.mock.contexts[0]).toHaveAttribute('id', 'categorias');
  });

  it('desplaza la vista a la sección al pulsar "Categorías" desde el header', async () => {
    renderHomePage();

    fireEvent.click(await screen.findByRole('link', { name: 'Categorías' }));

    await waitFor(() => expect(scrollIntoViewSpy).toHaveBeenCalled());
    expect(scrollIntoViewSpy.mock.contexts[0]).toHaveAttribute('id', 'categorias');
  });

  it('lista las categorías desde la API y cada tarjeta lleva al catálogo filtrado', async () => {
    renderHomePage();

    const primero = await screen.findByRole('link', { name: /Suplementos/ });
    expect(primero).toHaveAttribute('href', '/productos?idTipoProducto=3');
    const segundo = screen.getByRole('link', { name: /Accesorios/ });
    expect(segundo).toHaveAttribute('href', '/productos?idTipoProducto=7');
  });

  it('muestra el estado de carga mientras se piden las categorías', async () => {
    apiClient.defaults.adapter = async (config) =>
      new Promise((resolve) => {
        setTimeout(() =>
          resolve({
            data: config.url === '/api/tipos-producto' ? { data: [], total: 0 } : { data: [] },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          }),
        );
      });

    renderHomePage();

    expect(await screen.findByRole('status')).toHaveTextContent(/Cargando categorías/i);
  });

  it('muestra un aviso de error sin ocultar el resto de la portada', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/tipos-producto') {
        return {
          data: { statusCode: 500, message: 'Error interno' },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config,
        };
      }
      return { data: { data: [], total: 0 }, status: 200, statusText: 'OK', headers: {}, config };
    };

    renderHomePage();

    expect(await screen.findByRole('alert')).toHaveTextContent(/categorías/i);
    expect(
      screen.getByRole('heading', { name: 'Tu próximo objetivo empieza acá.' }),
    ).toBeInTheDocument();
  });

  it('oculta la sección de categorías cuando la API no devuelve tipos', async () => {
    apiClient.defaults.adapter = async (config) => ({
      data: config.url === '/api/tipos-producto' ? { data: [], total: 0 } : { data: [], total: 0 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    renderHomePage();

    await waitFor(() => {
      expect(screen.queryByText('Un espacio para cada meta.')).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole('heading', { name: 'Tu próximo objetivo empieza acá.' }),
    ).toBeInTheDocument();
  });
});
