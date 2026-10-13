import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/api.client';
import type { AuthResponse } from '../../models/Auth';
import { AuthContext, type AuthUser } from './AuthContext';
import { clearSession, getToken, setToken as persistToken } from './session';

const USER_KEY = 'entreno_user';

function esAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.nombre === 'string' &&
    typeof candidate.email === 'string' &&
    (candidate.rol === 'ADMIN' || candidate.rol === 'CLIENTE')
  );
}

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (esAuthUser(parsed)) return parsed;
  localStorage.removeItem(USER_KEY);
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    if (token) persistToken(token);
    else clearSession();
  }, [token]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });

    if (typeof data.token !== 'string' || !esAuthUser(data.usuario)) {
      throw new Error('La respuesta del servidor no tiene la forma de una sesión válida.');
    }

    setToken(data.token);
    setUser(data.usuario);
  }, []);

  const logout = useCallback(async () => {
    await apiClient.post('/api/auth/logout').catch(() => undefined);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
