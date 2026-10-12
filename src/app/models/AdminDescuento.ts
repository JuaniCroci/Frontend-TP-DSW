export interface AdminDescuento {
  id: number;
  descripcion: string;
  cantidadMinima: number;
  porcentaje: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AplicacionDescuento {
  id: number;
  idDescuento: number;
  idProducto: number;
  fechaDesde: string;
  fechaHasta: string;
  producto: { id: number; nombre: string };
}

export interface DetalleAdminDescuento extends AdminDescuento {
  aplicaciones: AplicacionDescuento[];
}

export interface RespuestaAdminDescuentos {
  data: AdminDescuento[];
  total: number;
}

export interface RespuestaProductosDescuento {
  data: Array<{ id: number; nombre: string; activo: boolean }>;
  total: number;
  page: number;
  size: number;
}

export interface CrearDescuentoAdmin {
  descripcion: string;
  cantidadMinima: number;
  porcentaje: number;
  activo?: boolean;
}

export interface ActualizarDescuentoAdmin {
  descripcion?: string;
  cantidadMinima?: number;
  porcentaje?: number;
  activo?: boolean;
}

export interface CrearAplicacionDescuentoAdmin {
  idProducto: number;
  fechaDesde: string;
  fechaHasta: string;
}
