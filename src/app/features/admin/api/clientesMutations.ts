import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type { AdminCliente, DatosCliente } from '../../../models/AdminCliente';
import { adminClientesKeys } from './clientesQueries';

interface ActualizarCliente {
  id: number;
  data: DatosCliente;
}

interface CambiarEstadoCliente {
  id: number;
  activo: boolean;
}

export function useActualizarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: ActualizarCliente) => {
      const response = await apiClient.put<AdminCliente>(`/api/clientes/${id}`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminClientesKeys.all }),
  });
}

export function useCambiarEstadoCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, activo }: CambiarEstadoCliente) => {
      const action = activo ? 'activar' : 'desactivar';
      const { data } = await apiClient.patch<AdminCliente>(`/api/clientes/${id}/${action}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminClientesKeys.all }),
  });
}
