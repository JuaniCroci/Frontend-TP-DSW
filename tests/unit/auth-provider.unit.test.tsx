/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiClient, TOKEN_KEY } from '@/core/api/api.client';
import { AuthProvider } from '@/core/auth/AuthProvider';
import { useAuth } from '@/core/auth/AuthContext';

const adapterOriginal = apiClient.defaults.adapter;

function SessionProbe() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <p>{isAuthenticated ? `Sesión: ${user?.email}` : 'Sin sesión'}</p>
      <button onClick={() => void login('cliente@entreno.test', 'clave')}>Iniciar sesión</button>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    apiClient.defaults.adapter = adapterOriginal;
  });

  it('persiste la sesión al iniciar y la limpia al cerrar', async () => {
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

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(screen.getByText('Sesión: cliente@entreno.test')).toBeInTheDocument();
      expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-de-prueba');
      expect(localStorage.getItem('entreno_user')).toContain('cliente@entreno.test');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => {
      expect(screen.getByText('Sin sesión')).toBeInTheDocument();
    });
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem('entreno_user')).toBeNull();
  });

  it('no revienta la app cuando el usuario guardado no es JSON válido', () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-vigente');
    localStorage.setItem('entreno_user', '{no-es-json');

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('Sin sesión')).toBeInTheDocument();
    expect(localStorage.getItem('entreno_user')).toBeNull();
  });

  it('descarta el usuario guardado si no tiene la forma de un AuthUser', () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-vigente');
    localStorage.setItem('entreno_user', JSON.stringify({ foo: 'bar' }));

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('Sin sesión')).toBeInTheDocument();
    expect(localStorage.getItem('entreno_user')).toBeNull();
  });

  it('restaura la sesión guardada sin consultar al backend', async () => {
    const requests: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push(`${config.method} ${config.url}`);
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    localStorage.setItem(TOKEN_KEY, 'jwt-vigente');
    localStorage.setItem(
      'entreno_user',
      JSON.stringify({ id: 3, nombre: 'Ana', email: 'ana@entreno.test', rol: 'CLIENTE' }),
    );

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('Sesión: ana@entreno.test')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(requests).toEqual([]);
  });

  it('logout invoca POST /api/auth/logout y limpia la sesión', async () => {
    const requests: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push(`${config.method} ${config.url}`);
      return {
        data: null,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config,
      };
    };

    localStorage.setItem(TOKEN_KEY, 'jwt-vigente');
    localStorage.setItem(
      'entreno_user',
      JSON.stringify({ id: 3, nombre: 'Ana', email: 'ana@entreno.test', rol: 'CLIENTE' }),
    );

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => {
      expect(requests).toEqual(['post /api/auth/logout']);
      expect(screen.getByText('Sin sesión')).toBeInTheDocument();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem('entreno_user')).toBeNull();
    });
  });

  it('la sesión se limpia aunque el logout falle', async () => {
    const requests: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push(`${config.method} ${config.url}`);
      throw new Error('El backend no respondió');
    };

    localStorage.setItem(TOKEN_KEY, 'jwt-vigente');
    localStorage.setItem(
      'entreno_user',
      JSON.stringify({ id: 3, nombre: 'Ana', email: 'ana@entreno.test', rol: 'CLIENTE' }),
    );

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => {
      expect(requests).toEqual(['post /api/auth/logout']);
      expect(screen.getByText('Sin sesión')).toBeInTheDocument();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });
});
