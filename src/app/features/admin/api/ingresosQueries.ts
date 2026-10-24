import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type {
  FiltrosIngresosAdmin,
  IngresoDetalle,
  RespuestaIngresos,
} from '../../../models/Ingreso.ts';

export const adminIngresosKeys = {
  all: ['admin', 'ingresos'] as const,
  list: (filtros: FiltrosIngresosAdmin) => ['admin', 'ingresos', 'listado', filtros] as const,
  detail: (id: number) => ['admin', 'ingresos', 'detalle', id] as const,
};

export function useAdminIngresos(filtros: FiltrosIngresosAdmin) {
  return useQuery({
    queryKey: adminIngresosKeys.list(filtros),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;

      const { data } = await apiClient.get<RespuestaIngresos>('/api/ingresos', { params });
      return data;
    },
  });
}

export function useAdminIngresoDetalle(id: number | null) {
  return useQuery({
    queryKey: adminIngresosKeys.detail(id ?? 0),
    queryFn: async () => {
      if (!id) throw new Error('No hay ingreso seleccionado');
      const { data } = await apiClient.get<IngresoDetalle>(`/api/ingresos/${id}`);
      return data;
    },
    enabled: !!id,
  });
}