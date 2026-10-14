import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type { FiltrosPedidosAdmin, PedidoDetalle, RespuestaPedidos } from '../../../models/Pedido';

export const pedidoKeys = {
  mine: ['pedidos', 'mis-pedidos'] as const,
  mineDetail: (id: number | null) => ['pedidos', 'mis-pedidos', id ?? 0] as const,
  admin: (filters: FiltrosPedidosAdmin) => ['admin', 'pedidos', filters] as const,
  adminDetail: (id: number | null) => ['admin', 'pedidos', 'detalle', id ?? 0] as const,
};

export function useMisPedidos() {
  return useQuery({
    queryKey: pedidoKeys.mine,
    queryFn: async () => {
      const { data } = await apiClient.get<RespuestaPedidos>('/api/mis-pedidos');
      return data;
    },
  });
}

export function useMiPedidoDetalle(id: number | null) {
  return useQuery({
    queryKey: pedidoKeys.mineDetail(id),
    queryFn: async () => {
      if (id === null) throw new Error('No hay un pedido seleccionado');
      const { data } = await apiClient.get<PedidoDetalle>(`/api/mis-pedidos/${id}`);
      return data;
    },
    enabled: id !== null,
  });
}

export function useAdminPedidos(filters: FiltrosPedidosAdmin) {
  return useQuery({
    queryKey: pedidoKeys.admin(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<RespuestaPedidos>('/api/pedidos', {
        params: {
          desde: filters.desde || undefined,
          hasta: filters.hasta || undefined,
          estado: filters.estado || undefined,
          cliente: filters.cliente || undefined,
          page: filters.page,
          size: filters.size,
        },
      });
      return data;
    },
  });
}

export function useAdminPedidoDetalle(id: number | null) {
  return useQuery({
    queryKey: pedidoKeys.adminDetail(id),
    queryFn: async () => {
      if (id === null) throw new Error('No hay un pedido seleccionado');
      const { data } = await apiClient.get<PedidoDetalle>(`/api/pedidos/${id}`);
      return data;
    },
    enabled: id !== null,
  });
}
