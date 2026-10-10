import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import { adminCatalogoKeys } from './queries';
import type {
  DatosMaestro,
  RegistroCatalogo,
  RecursoCatalogo,
} from '../../../models/AdminCatalogo';

interface GuardarMaestro {
  resource: RecursoCatalogo;
  data: DatosMaestro;
  id?: number;
}

interface BajaMaestro {
  resource: RecursoCatalogo;
  id: number;
}

export function useGuardarMaestro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resource, data, id }: GuardarMaestro) => {
      const response = id
        ? await apiClient.put<RegistroCatalogo>(`/api/${resource}/${id}`, data)
        : await apiClient.post<RegistroCatalogo>(`/api/${resource}`, data);
      return response.data;
    },
    onSuccess: (_data, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCatalogoKeys.list(variables.resource) }),
        queryClient.invalidateQueries({ queryKey: adminCatalogoKeys.all }),
        queryClient.invalidateQueries({ queryKey: [variables.resource] }),
      ]),
  });
}

export function useDarDeBajaMaestro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resource, id }: BajaMaestro) => {
      await apiClient.delete(`/api/${resource}/${id}`);
    },
    onSuccess: (_data, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCatalogoKeys.list(variables.resource) }),
        queryClient.invalidateQueries({ queryKey: adminCatalogoKeys.all }),
        queryClient.invalidateQueries({ queryKey: [variables.resource] }),
      ]),
  });
}
