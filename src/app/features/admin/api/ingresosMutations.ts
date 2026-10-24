import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type { CrearIngresoInput, IngresoDetalle } from '../../../models/Ingreso.ts';
import { adminIngresosKeys } from './ingresosQueries.ts';

export function useCrearIngreso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CrearIngresoInput) => {
      const { data } = await apiClient.post<IngresoDetalle>('/api/ingresos', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIngresosKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useAnularIngreso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.post<IngresoDetalle>(`/api/ingresos/${id}/anular`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminIngresosKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}