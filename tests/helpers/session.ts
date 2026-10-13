import { TOKEN_KEY } from '@/core/api/api.client';

export function saveSession(rol: 'ADMIN' | 'CLIENTE'): void {
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
