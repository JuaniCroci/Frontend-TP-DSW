/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
});
