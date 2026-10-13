import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type {
  FiltrosProducto,
  ProductoDetalle,
  ProductoListado,
} from '../../../models/Producto';
import type { Marca } from '../../../models/Marca';
import type { RespuestaLista } from '../../../models/RespuestaLista';
import type { TipoProducto } from '../../../models/TipoProducto';

export const productosQueryKeys = {
  all: ['productos'] as const,
  list: (filters: FiltrosProducto) => ['productos', 'listado', filters] as const,
  detail: (id: number) => ['productos', 'detalle', id] as const,
  marcas: ['marcas', 'catalogo'] as const,
  tipos: ['tipos-producto', 'catalogo'] as const,
};

export function useProductos(filters: FiltrosProducto) {
  return useQuery({
    queryKey: productosQueryKeys.list(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<RespuestaLista<ProductoListado>>('/api/productos', {
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
      const { data } = await apiClient.get<RespuestaLista<Marca>>('/api/marcas');
      return data.data;
    },
  });
}

export function useTiposProductoCatalogo() {
  return useQuery({
    queryKey: productosQueryKeys.tipos,
    queryFn: async () => {
      const { data } = await apiClient.get<RespuestaLista<TipoProducto>>('/api/tipos-producto');
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
