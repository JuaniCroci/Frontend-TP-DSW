export interface ItemCarrito {
  id: number;
  producto: {
    id: number;
    nombre: string;
    precioUnitario: string;
  };
  cantidad: number;
  subtotal: string;
}

export interface Carrito {
  id: number;
  estado: 'ACTIVO' | 'CONCLUIDO';
  items: ItemCarrito[];
  total: string;
}

export interface PedidoConfirmado {
  id: number;
  fecha: string;
  estado: 'REALIZADO' | 'ABONADO' | 'ENTREGADO' | 'CANCELADO';
  importeTotal: string;
  usuario: { id: number; nombre: string; email: string };
  items: Array<{
    id: number;
    producto: { id: number; nombre: string };
    cantidad: number;
    precioUnitario: string;
    subtotal: string;
    descuentoAplicado: string | null;
  }>;
}
