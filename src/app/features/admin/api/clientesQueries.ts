import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type { AdminCliente, RespuestaClientes } from '../../../models/AdminCliente';

export type EstadoClienteFiltro = 'todos' | 'activos' | 'inactivos';

export const adminClientesKeys = {
  all: ['admin', 'clientes'] as const,
  list: (q: string, estado: EstadoClienteFiltro) =>
    ['admin', 'clientes', 'list', q, estado] as const,
  detail: (id: number) => ['admin', 'clientes', 'detail', id] as const,
};

export function useAdminClientes(q: string, estado: EstadoClienteFiltro) {
  return useQuery({
    queryKey: adminClientesKeys.list(q, estado),
    queryFn: async () => {
      const params: { q?: string; activo?: boolean } = {};
      if (q.trim()) params.q = q.trim();
      if (estado !== 'todos') params.activo = estado === 'activos';
      const { data } = await apiClient.get<RespuestaClientes>('/api/clientes', { params });
      return data;
    },
  });
}

export function useAdminClienteDetalle(id: number | null) {
  return useQuery({
    queryKey: adminClientesKeys.detail(id ?? 0),
    queryFn: async () => {
      if (id === null) throw new Error('No hay un cliente seleccionado');
      const { data } = await apiClient.get<AdminCliente>(`/api/clientes/${id}`);
      return data;
    },
    enabled: id !== null,
  });
}
