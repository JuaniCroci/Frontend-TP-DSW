import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type {
  FiltrosProducto,
  ListaRespuesta,
  Marca,
  ProductoDetalle,
  ProductoListado,
  TipoProducto,
} from '../../../models/Producto';

export const productosQueryKeys = {
  all: ['productos'] as const,
  list: (filters: FiltrosProducto) => ['productos', 'list', filters] as const,
  detail: (id: number) => ['productos', 'detail', id] as const,
  marcas: ['marcas', 'catalogo'] as const,
  tipos: ['tipos-producto', 'catalogo'] as const,
};

export function useProductos(filters: FiltrosProducto) {
  return useQuery({
    queryKey: productosQueryKeys.list(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<ListaRespuesta<ProductoListado>>('/api/productos', {
        params: filters,
      });
      return data;
    },
  });
}

export function useMarcasCatalogo() {
  return useQuery({
    queryKey: productosQueryKeys.marcas,
    queryFn: async () => {
      const { data } = await apiClient.get<ListaRespuesta<Marca>>('/api/marcas');
      return data.data;
    },
  });
}

export function useTiposProductoCatalogo() {
  return useQuery({
    queryKey: productosQueryKeys.tipos,
    queryFn: async () => {
      const { data } = await apiClient.get<ListaRespuesta<TipoProducto>>('/api/tipos-producto');
      return data.data;
    },
  });
}

export function useProductoDetalle(id: number) {
  return useQuery({
    queryKey: productosQueryKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ProductoDetalle>(`/api/productos/${id}`);
      return data;
    },
    enabled: Number.isInteger(id) && id > 0,
  });
}
