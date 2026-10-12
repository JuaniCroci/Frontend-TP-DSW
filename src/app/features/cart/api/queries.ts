import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type { Carrito } from '../../../models/Carrito';

export const carritoQueryKeys = {
  active: ['carrito', 'activo'] as const,
};

export function useCarrito() {
  return useQuery({
    queryKey: carritoQueryKeys.active,
    queryFn: async () => {
      const { data } = await apiClient.get<Carrito>('/api/carrito');
      return data;
    },
  });
}
