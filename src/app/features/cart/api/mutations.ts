import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type { Carrito, PedidoConfirmado } from '../../../models/Carrito';
import { productosQueryKeys } from '../../products/api/queries';
import { carritoQueryKeys } from './queries';

export function useAgregarAlCarrito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ idProducto, cantidad }: { idProducto: number; cantidad: number }) => {
      const { data } = await apiClient.post<Carrito>('/api/carrito/items', {
        idProducto,
        cantidad,
      });
      return data;
    },
    onSuccess: (carrito) => queryClient.setQueryData(carritoQueryKeys.active, carrito),
  });
}

export function useActualizarItemCarrito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, cantidad }: { id: number; cantidad: number }) => {
      const { data } = await apiClient.put<Carrito>(`/api/carrito/items/${id}`, { cantidad });
      return data;
    },
    onSuccess: (carrito) => queryClient.setQueryData(carritoQueryKeys.active, carrito),
  });
}

export function useQuitarItemCarrito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/carrito/items/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: carritoQueryKeys.active }),
  });
}

export function useConfirmarCarrito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<PedidoConfirmado>('/api/carrito/confirmar');
      return data;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: carritoQueryKeys.active }),
        queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
      ]),
  });
}
