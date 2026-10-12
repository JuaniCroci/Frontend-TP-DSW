import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type {
  DetalleAdminDescuento,
  RespuestaAdminDescuentos,
  RespuestaProductosDescuento,
} from '../../../models/AdminDescuento';

export const adminDescuentosKeys = {
  all: ['admin', 'descuentos'] as const,
  detail: (id: number) => ['admin', 'descuentos', 'detalle', id] as const,
  productos: ['admin', 'descuentos', 'productos-activos'] as const,
};

export function useAdminDescuentos() {
  return useQuery({
    queryKey: adminDescuentosKeys.all,
    queryFn: async () => {
      const { data } = await apiClient.get<RespuestaAdminDescuentos>('/api/descuentos');
      return data;
    },
  });
}

export function useAdminDescuentoDetalle(id: number | null) {
  return useQuery({
    queryKey: adminDescuentosKeys.detail(id ?? 0),
    queryFn: async () => {
      if (id === null) throw new Error('No hay un descuento seleccionado');
      const { data } = await apiClient.get<DetalleAdminDescuento>(`/api/descuentos/${id}`);
      return data;
    },
    enabled: id !== null,
  });
}

export function useProductosActivosDescuento(enabled: boolean) {
  return useQuery({
    queryKey: adminDescuentosKeys.productos,
    queryFn: async () => {
      const { data } = await apiClient.get<RespuestaProductosDescuento>('/api/productos/admin', {
        params: { activo: true, page: 1, size: 100 },
      });
      return data.data.filter((producto) => producto.activo);
    },
    enabled,
  });
}
