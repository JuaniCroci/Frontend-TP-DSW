export interface AdminProducto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precioUnitario: string;
  stock: number;
  activo: boolean;
  tipoProducto: { id: number; nombre: string };
  marca: { id: number; nombre: string };
  proveedor: { id: number; razonSocial: string; activo: boolean } | null;
  imagenPrincipal: ImagenPrincipalProducto | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImagenPrincipalProducto {
  id: string;
  url: string;
  altText: string;
}

export interface FotoProductoAdmin extends ImagenPrincipalProducto {
  fuente: string;
  licencia: string;
  atribucion: string | null;
  mimeType: string;
  sizeBytes: number;
  esPrincipal: boolean;
  createdAt: string;
}

export interface RespuestaFotosProducto {
  data: FotoProductoAdmin[];
}

export interface AdminProductoFilters {
  nombre?: string;
  idTipoProducto?: number;
  idMarca?: number;
  idProveedor?: number;
  activo?: boolean;
  page: number;
  size: number;
}

export interface RespuestaAdminProductos {
  data: AdminProducto[];
  total: number;
  page: number;
  size: number;
}

export interface CrearProductoAdmin {
  nombre: string;
  descripcion?: string;
  precioUnitario: string;
  stockInicial: number;
  idTipoProducto: number;
  idMarca: number;
  idProveedor?: number;
}

export interface ActualizarProductoAdmin {
  nombre: string;
  descripcion: string | null;
  precioUnitario: string;
  idTipoProducto?: number;
  idMarca?: number;
  idProveedor?: number;
}
