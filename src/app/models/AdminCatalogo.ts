export interface Marca {
  id: number;
  nombre: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TipoProducto {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Proveedor {
  id: number;
  razonSocial: string;
  cuit: string;
  telefono: string | null;
  email: string | null;
  domicilio: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RegistroCatalogo = Marca | TipoProducto | Proveedor;

export interface RespuestaLista<T> {
  data: T[];
  total: number;
}

export type RecursoCatalogo = 'marcas' | 'tipos-producto' | 'proveedores';

export type DatosMaestro = Record<string, string>;
