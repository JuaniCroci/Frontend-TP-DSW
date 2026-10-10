/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import App from '../../src/App';

const adapterOriginal = apiClient.defaults.adapter;

describe('app shell', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('navega desde la portada al login y vuelve al iniciar sesión', async () => {
    apiClient.defaults.adapter = async (config) => ({
      data: {
        token: 'jwt-de-prueba',
        usuario: {
          id: 1,
          nombre: 'Cliente',
          email: 'cliente@entreno.test',
          rol: 'CLIENTE',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Tu próximo objetivo empieza acá.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Categorías' })).toHaveAttribute(
      'href',
      '/#categorias',
    );

    const navigation = screen.getByRole('navigation', { name: 'Navegación principal' });
    fireEvent.click(within(navigation).getByRole('link', { name: 'Iniciar sesión' }));
    expect(screen.getByRole('heading', { name: 'Entreno 2.0' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'cliente@entreno.test' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'clave' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByRole('heading', { name: 'Tu próximo objetivo empieza acá.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Hola, Cliente')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(
      within(screen.getByRole('navigation', { name: 'Navegación principal' })).getByRole('link', {
        name: 'Iniciar sesión',
      }),
    ).toBeInTheDocument();
  });

  it('redirige al inicio desde una ruta desconocida', async () => {
    window.history.replaceState({}, '', '/ruta-inexistente');

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Tu próximo objetivo empieza acá.' }),
    ).toBeInTheDocument();
  });

  it('abre el catálogo desde la navegación principal', async () => {
    apiClient.defaults.adapter = async (config) => ({
      data:
        config.url === '/api/productos'
          ? { data: [], total: 0, page: 1, size: 12 }
          : { data: [], total: 0 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    render(<App />);
    fireEvent.click(screen.getByRole('link', { name: 'Tienda' }));

    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Todavía no hay productos disponibles' }),
    ).toBeInTheDocument();
  });
});
