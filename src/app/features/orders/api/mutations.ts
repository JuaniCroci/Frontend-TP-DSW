import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type { PedidoDetalle } from '../../../models/Pedido';
import { pedidoKeys } from './queries';

export function useEntregarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.post<PedidoDetalle>(`/api/pedidos/${id}/entregar`);
      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pedidoKeys.mine }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'pedidos'] }),
      ]);
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.post<PedidoDetalle>(`/api/pedidos/${id}/cancelar`);
      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pedidoKeys.mine }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'pedidos'] }),
      ]);
    },
  });
}
