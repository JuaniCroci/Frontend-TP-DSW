import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type {
  AdminProducto,
  AdminProductoFilters,
  RespuestaFotosProducto,
  RespuestaAdminProductos,
} from '../../../models/AdminProducto';
import type { Proveedor, RespuestaLista } from '../../../models/AdminCatalogo';

export const adminProductosKeys = {
  all: ['admin', 'productos'] as const,
  list: (filters: AdminProductoFilters) => ['admin', 'productos', 'list', filters] as const,
  detail: (id: number) => ['admin', 'productos', 'detail', id] as const,
  images: (id: number) => ['admin', 'productos', 'images', id] as const,
  proveedores: ['admin', 'productos', 'proveedores-activos'] as const,
};

export function useAdminProductos(filters: AdminProductoFilters) {
  return useQuery({
    queryKey: adminProductosKeys.list(filters),
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {
        page: filters.page,
        size: filters.size,
      };
      if (filters.nombre) params.nombre = filters.nombre;
      if (filters.idTipoProducto !== undefined) params.idTipoProducto = filters.idTipoProducto;
      if (filters.idMarca !== undefined) params.idMarca = filters.idMarca;
      if (filters.idProveedor !== undefined) params.idProveedor = filters.idProveedor;
      if (filters.activo === true) params.activo = true;
      if (filters.activo === false) params.inactivos = true;

      const { data } = await apiClient.get<RespuestaAdminProductos>('/api/productos/admin', {
        params,
      });
      return data;
    },
  });
}

export function useImagenesProductoAdmin(id: number | null) {
  return useQuery({
    queryKey: adminProductosKeys.images(id ?? 0),
    queryFn: async () => {
      if (id === null) throw new Error('No hay un producto seleccionado');
      const { data } = await apiClient.get<RespuestaFotosProducto>(
        `/api/productos/admin/${id}/imagenes`,
      );
      return data.data;
    },
    enabled: id !== null,
  });
}

export function useAdminProductoDetalle(id: number | null) {
  return useQuery({
    queryKey: adminProductosKeys.detail(id ?? 0),
    queryFn: async () => {
      if (id === null) throw new Error('No hay un producto seleccionado');
      const { data } = await apiClient.get<AdminProducto>(`/api/productos/admin/${id}`);
      return data;
    },
    enabled: id !== null,
  });
}

export function useProveedoresActivosProducto() {
  return useQuery({
    queryKey: adminProductosKeys.proveedores,
    queryFn: async () => {
      const { data } = await apiClient.get<RespuestaLista<Proveedor>>('/api/proveedores');
      return data.data.filter((proveedor) => proveedor.activo);
    },
  });
}
