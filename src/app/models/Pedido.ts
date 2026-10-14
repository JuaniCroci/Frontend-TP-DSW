export type EstadoPedido = 'REALIZADO' | 'ABONADO' | 'ENTREGADO' | 'CANCELADO';

export interface ClientePedido {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
}

export interface LineaPedido {
  id: number;
  producto: { id: number; nombre: string };
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
  descuentoAplicado: string | null;
}

export interface PedidoResumen {
  id: number;
  fecha: string;
  estado: EstadoPedido;
  importeTotal: string;
  usuario: ClientePedido;
  createdAt: string;
  updatedAt: string;
  fechaEntrega?: string | null;
}

export interface PedidoDetalle extends PedidoResumen {
  items: LineaPedido[];
}

export interface RespuestaPedidos {
  data: PedidoResumen[];
  total: number;
  page?: number;
  size?: number;
}

export interface FiltrosPedidosAdmin {
  desde: string;
  hasta: string;
  estado: EstadoPedido | '';
  cliente: string;
  page: number;
  size: number;
}
