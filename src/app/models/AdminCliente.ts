import type { RespuestaLista } from './RespuestaLista';

export interface AdminCliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  rol: 'CLIENTE';
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RespuestaClientes = RespuestaLista<AdminCliente>;

export interface DatosCliente {
  nombre: string;
  email: string;
  password?: string;
  telefono?: string;
  direccion?: string;
}
