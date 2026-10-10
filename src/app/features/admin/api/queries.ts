import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type {
  RegistroCatalogo,
  RecursoCatalogo,
  RespuestaLista,
} from '../../../models/AdminCatalogo';

export const adminCatalogoKeys = {
  all: ['admin', 'catalogo'] as const,
  list: (resource: RecursoCatalogo) => ['admin', 'catalogo', resource, 'list'] as const,
  detail: (resource: RecursoCatalogo, id: number) =>
    ['admin', 'catalogo', resource, 'detail', id] as const,
};

export function useAdminCatalogo(resource: RecursoCatalogo) {
  return useQuery({
    queryKey: adminCatalogoKeys.list(resource),
    queryFn: async () => {
      const { data } = await apiClient.get<RespuestaLista<RegistroCatalogo>>(`/api/${resource}`, {
        params: { includeInactive: true },
      });
      return data;
    },
  });
}

export function useAdminCatalogoDetalle(resource: RecursoCatalogo, id: number | null) {
  return useQuery({
    queryKey: adminCatalogoKeys.detail(resource, id ?? 0),
    queryFn: async () => {
      if (id === null) throw new Error('No hay un registro seleccionado');
      const { data } = await apiClient.get<RegistroCatalogo>(`/api/${resource}/${id}`);
      return data;
    },
    enabled: id !== null,
  });
}
