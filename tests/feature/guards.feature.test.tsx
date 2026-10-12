/** @vitest-environment jsdom */
import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiClient, TOKEN_KEY } from '@/core/api/api.client';
import { AuthProvider } from '@/core/auth/AuthProvider';
import { AdminRoute } from '@/core/guards/AdminRoute';
import { ClientRoute } from '@/core/guards/ClientRoute';

const adapterOriginal = apiClient.defaults.adapter;

function LoginDestination() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? 'sin-from';
  return (
    <div data-testid="login-destination">
      <span data-testid="login-from">{from}</span>
    </div>
  );
}

function saveSession(rol: 'ADMIN' | 'CLIENTE'): void {
  localStorage.setItem(TOKEN_KEY, 'token-de-prueba');
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

function renderRutaProtegida(ruta: string, guard: React.ReactElement) {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginDestination />} />
          <Route path="/" element={<div data-testid="home-destination" />} />
          <Route path={ruta} element={guard}>
            <Route index element={<div data-testid="guard-content">Contenido protegido</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('guards de ruta', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('sin sesión: AdminRoute redirige a /login', async () => {
    renderRutaProtegida('/admin', <AdminRoute />);

    expect(await screen.findByTestId('login-destination')).toBeInTheDocument();
  });

  it('sin sesión: ClientRoute redirige a /login', async () => {
    renderRutaProtegida('/carrito', <ClientRoute />);

    expect(await screen.findByTestId('login-destination')).toBeInTheDocument();
  });

  it('sin sesión: AdminRoute conserva la ruta original como state.from', async () => {
    renderRutaProtegida('/admin', <AdminRoute />);

    expect(await screen.findByTestId('login-destination')).toBeInTheDocument();
    expect(screen.getByTestId('login-from')).toHaveTextContent('/admin');
  });

  it('sesión CLIENTE: AdminRoute redirige a /', async () => {
    saveSession('CLIENTE');
    renderRutaProtegida('/admin', <AdminRoute />);

    expect(await screen.findByTestId('home-destination')).toBeInTheDocument();
  });

  it('sesión ADMIN: AdminRoute renderiza las rutas hijas', async () => {
    saveSession('ADMIN');
    renderRutaProtegida('/admin', <AdminRoute />);

    expect(await screen.findByTestId('guard-content')).toBeInTheDocument();
  });

  it('con sesión activa: el evento auth:session-expired cierra la sesión y redirige a /login', async () => {
    saveSession('ADMIN');
    renderRutaProtegida('/admin', <AdminRoute />);

    expect(await screen.findByTestId('guard-content')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('auth:session-expired'));
    });

    expect(await screen.findByTestId('login-destination')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
