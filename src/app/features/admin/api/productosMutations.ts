import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type {
  ActualizarProductoAdmin,
  AdminProducto,
  CrearProductoAdmin,
} from '../../../models/AdminProducto';
import { productosQueryKeys } from '../../products/api/queries';
import { adminProductosKeys } from './productosQueries';

export function useCrearProductoAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CrearProductoAdmin) => {
      const { data: producto } = await apiClient.post<AdminProducto>('/api/productos', data);
      return producto;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: adminProductosKeys.all }),
        queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
      ]),
  });
}

export function useActualizarProductoAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ActualizarProductoAdmin }) => {
      const { data: producto } = await apiClient.put<AdminProducto>(
        `/api/productos/admin/${id}`,
        data,
      );
      return producto;
    },
    onSuccess: (_producto, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: adminProductosKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminProductosKeys.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
      ]),
  });
}

export function useDarDeBajaProductoAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/productos/admin/${id}`);
    },
    onSuccess: (_result, id) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: adminProductosKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminProductosKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
      ]),
  });
}
