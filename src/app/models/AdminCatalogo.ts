import type { Marca } from './Marca';
import type { TipoProducto } from './TipoProducto';

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

export type RecursoCatalogo = 'marcas' | 'tipos-producto' | 'proveedores';

export type DatosMaestro = Record<string, string>;

export type PayloadMaestro = Record<string, string | null>;
