import type { Usuario } from './Usuario';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: Usuario;
}
