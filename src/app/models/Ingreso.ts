import type { RespuestaLista } from './RespuestaLista';

export type EstadoIngreso = 'REGISTRADO' | 'ANULADO';

export interface IngresoLineaItem {
  id: number;
  idProducto: number;
  producto: {
    id: number;
    nombre: string;
  };
  cantidad: number;
  precioUnitario: string;
  importeLinea: string;
}

export interface IngresoResumen {
  id: number;
  nroIngreso: string;
  fecha: string;
  importeTotal: string;
  estado: EstadoIngreso;
  proveedor: {
    id: number;
    razonSocial: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IngresoDetalle extends IngresoResumen {
  items: IngresoLineaItem[];
}

export type RespuestaIngresos = RespuestaLista<IngresoResumen>;

export interface LineaIngresoInput {
  idProducto: number;
  cantidad: number;
  precioUnitario: string;
}

export interface CrearIngresoInput {
  nroIngreso: string;
  idProveedor: number;
  fecha?: string;
  lineas: LineaIngresoInput[];
}

export interface FiltrosIngresosAdmin {
  estado?: EstadoIngreso | '';
  desde?: string;
  hasta?: string;
}