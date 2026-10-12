import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type {
  ActualizarDescuentoAdmin,
  AdminDescuento,
  CrearAplicacionDescuentoAdmin,
  CrearDescuentoAdmin,
} from '../../../models/AdminDescuento';
import { productosQueryKeys } from '../../products/api/queries';
import { adminDescuentosKeys } from './descuentosQueries';

function useInvalidateDescuentos() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminDescuentosKeys.all }),
      queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
    ]);
}

export function useCrearDescuentoAdmin() {
  const invalidate = useInvalidateDescuentos();

  return useMutation({
    mutationFn: async (data: CrearDescuentoAdmin) => {
      const { data: descuento } = await apiClient.post<AdminDescuento>('/api/descuentos', data);
      return descuento;
    },
    onSuccess: invalidate,
  });
}

export function useActualizarDescuentoAdmin() {
  const invalidate = useInvalidateDescuentos();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ActualizarDescuentoAdmin }) => {
      const { data: descuento } = await apiClient.put<AdminDescuento>(
        `/api/descuentos/${id}`,
        data,
      );
      return descuento;
    },
    onSuccess: invalidate,
  });
}

export function useDesactivarDescuentoAdmin() {
  const invalidate = useInvalidateDescuentos();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/descuentos/${id}`);
    },
    onSuccess: invalidate,
  });
}

export function useCrearAplicacionDescuentoAdmin() {
  const invalidate = useInvalidateDescuentos();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CrearAplicacionDescuentoAdmin }) => {
      const { data: aplicacion } = await apiClient.post(`/api/descuentos/${id}/aplicaciones`, data);
      return aplicacion;
    },
    onSuccess: invalidate,
  });
}

export function useEliminarAplicacionDescuentoAdmin() {
  const invalidate = useInvalidateDescuentos();

  return useMutation({
    mutationFn: async ({ id, aplicacionId }: { id: number; aplicacionId: number }) => {
      await apiClient.delete(`/api/descuentos/${id}/aplicaciones/${aplicacionId}`);
    },
    onSuccess: invalidate,
  });
}
