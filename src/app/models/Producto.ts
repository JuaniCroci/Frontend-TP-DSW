export interface ProductoListado {
  id: number;
  nombre: string;
  marca: {
    id: number;
    nombre: string;
  };
  precioUnitario: string;
  disponible: boolean;
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

export interface DescuentoVigente {
  id: number;
  descripcion: string;
  cantidadMinima: number;
  porcentaje: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface ListaRespuesta<T> {
  data: T[];
  total: number;
  page?: number;
  size?: number;
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
