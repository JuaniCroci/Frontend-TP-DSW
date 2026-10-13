import type { AdminDescuento } from './AdminDescuento';

export type DescuentoVigente = AdminDescuento;

export interface ImagenPrincipalProducto {
  id: string;
  url: string;
  altText: string;
}

export interface ProductoListado {
  id: number;
  nombre: string;
  marca: {
    id: number;
    nombre: string;
  };
  precioUnitario: string;
  disponible: boolean;
  imagenPrincipal: ImagenPrincipalProducto | null;
}

export interface ProductoDetalle extends ProductoListado {
  descripcion: string | null;
  stock: number;
  activo: boolean;
  tipoProducto: {
    id: number;
    nombre: string;
  };
  proveedor: {
    id: number;
    razonSocial: string;
    activo: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
  descuentosVigentes: DescuentoVigente[];
}

export interface FiltrosProducto {
  idTipoProducto?: number;
  idMarca?: number;
  precioMin?: number;
  precioMax?: number;
  orden?: 'nombre' | 'precio';
  dir?: 'asc' | 'desc';
  page: number;
  size: number;
}
