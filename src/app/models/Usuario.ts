export type Rol = 'ADMIN' | 'CLIENTE';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  rol: Rol;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
