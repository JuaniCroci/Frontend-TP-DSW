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

export interface RespuestaClientes {
  data: AdminCliente[];
  total: number;
}

export interface DatosCliente {
  nombre: string;
  email: string;
  password?: string;
  telefono?: string;
  direccion?: string;
}
