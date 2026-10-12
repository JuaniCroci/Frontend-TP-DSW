/** @vitest-environment jsdom */
import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import { AuthProvider } from '@/core/auth/AuthProvider';
import { AdminRoute } from '@/core/guards/AdminRoute';
import { ProtectedRoute } from '@/core/guards/ProtectedRoute';
import type { Usuario } from '@/models/Usuario';

const adapterOriginal = apiClient.defaults.adapter;

const userFixture: Usuario = {
  id: 1,
  nombre: 'Ana Cliente',
  email: 'ana@entreno.com.ar',
  telefono: '1155555555',
  direccion: 'Av. Siempreviva 742',
  rol: 'CLIENTE',
  activo: true,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
};

function mockMeResponse(usuario: Usuario): void {
  apiClient.defaults.adapter = async (config) => ({
    data: usuario,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });
}

describe('guards de ruta', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('sin token: ProtectedRoute redirige a /login', async () => {
    render(
      <MemoryRouter initialEntries={['/panel']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div data-testid="login-destination" />} />
            <Route
              path="/panel"
              element={
                <ProtectedRoute>
                  <div>Panel</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('login-destination')).toBeInTheDocument();
  });

  it('token con rol CLIENTE: AdminRoute redirige a /', async () => {
    localStorage.setItem('token', 'jwt-de-cliente');
    mockMeResponse(userFixture);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<div data-testid="home-destination" />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <div>Admin</div>
                </AdminRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('home-destination')).toBeInTheDocument();
  });

  it('token con rol ADMIN: AdminRoute renderiza children', async () => {
    localStorage.setItem('token', 'jwt-de-admin');
    mockMeResponse({ ...userFixture, rol: 'ADMIN' });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<div data-testid="home-destination" />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <div data-testid="admin-content">ABM de productos</div>
                </AdminRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('admin-content')).toBeInTheDocument();
  });

  it('con sesión activa: el evento auth:session-expired cierra la sesión y redirige a /login', async () => {
    localStorage.setItem('token', 'jwt-activo');
    mockMeResponse(userFixture);

    render(
      <MemoryRouter initialEntries={['/panel']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div data-testid="login-destination" />} />
            <Route
              path="/panel"
              element={
                <ProtectedRoute>
                  <div data-testid="panel-content">Panel</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('panel-content')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('auth:session-expired'));
    });

    expect(await screen.findByTestId('login-destination')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
