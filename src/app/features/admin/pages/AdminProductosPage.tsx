import { useState } from 'react';
import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { formatMoney } from '../../../shared/utils/formatMoney';
import { AdminBanner } from '../../../shared/components/AdminBanner';
import { EstadoBadge } from '../../../shared/components/EstadoBadge';
import type {
  ActualizarProductoAdmin,
  AdminProducto,
  CrearProductoAdmin,
} from '../../../models/AdminProducto';
import {
  useActualizarProductoAdmin,
  useCrearProductoAdmin,
  useDarDeBajaProductoAdmin,
} from '../api/productosMutations';
import {
  useAdminProductoDetalle,
  useAdminProductos,
  useProveedoresActivosProducto,
} from '../api/productosQueries';
import { useMarcasCatalogo, useTiposProductoCatalogo } from '../../products/api/queries';
import { ProductoDetalleModal } from '../components/ProductoDetalleModal';
import {
  ProductoFiltersForm,
  type EstadoProducto,
  type FiltrosProductoDraft,
} from '../components/ProductoFiltersForm';
import { ProductoForm } from '../components/ProductoForm';
import { ProductoImagenesPanel } from '../components/ProductoImagenesPanel';

const PAGE_SIZE = 20;

type ModoFormulario = 'crear' | 'editar' | null;

export default function AdminProductosPage() {
  const [filters, setFilters] = useState({
    nombre: '',
    idTipoProducto: '',
    idMarca: '',
    idProveedor: '',
    estado: 'todos' as EstadoProducto,
    page: 1,
  });
  const [modo, setModo] = useState<ModoFormulario>(null);
  const [editing, setEditing] = useState<AdminProducto | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [imageProduct, setImageProduct] = useState<AdminProducto | null>(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const productos = useAdminProductos({
    nombre: filters.nombre || undefined,
    idTipoProducto: filters.idTipoProducto ? Number(filters.idTipoProducto) : undefined,
    idMarca: filters.idMarca ? Number(filters.idMarca) : undefined,
    idProveedor: filters.idProveedor ? Number(filters.idProveedor) : undefined,
    activo:
      filters.estado === 'activos' ? true : filters.estado === 'inactivos' ? false : undefined,
    page: filters.page,
    size: PAGE_SIZE,
  });
  const marcasQuery = useMarcasCatalogo();
  const tiposQuery = useTiposProductoCatalogo();
  const proveedoresQuery = useProveedoresActivosProducto();
  const detalle = useAdminProductoDetalle(detailId);
  const crear = useCrearProductoAdmin();
  const actualizar = useActualizarProductoAdmin();
  const darDeBaja = useDarDeBajaProductoAdmin();
  const marcas = (marcasQuery.data ?? []).filter((marca) => marca.activo);
  const tipos = (tiposQuery.data ?? []).filter((tipo) => tipo.activo);
  const proveedores = proveedoresQuery.data ?? [];
  const mastersReady =
    !marcasQuery.isLoading &&
    !tiposQuery.isLoading &&
    !proveedoresQuery.isLoading &&
    !marcasQuery.isError &&
    !tiposQuery.isError &&
    !proveedoresQuery.isError;
  const totalPages = Math.max(1, Math.ceil((productos.data?.total ?? 0) / PAGE_SIZE));

  function handleApplyFilters(draft: FiltrosProductoDraft) {
    setFilters({
      nombre: draft.nombre,
      idTipoProducto: draft.idTipoProducto,
      idMarca: draft.idMarca,
      idProveedor: draft.idProveedor,
      estado: draft.estado,
      page: 1,
    });
  }

  function handleClearFilters() {
    setFilters({
      nombre: '',
      idTipoProducto: '',
      idMarca: '',
      idProveedor: '',
      estado: 'todos',
      page: 1,
    });
  }

  function handleStartCreate() {
    setModo('crear');
    setEditing(null);
    setNotice('');
    setActionError('');
  }

  function handleStartEdit(producto: AdminProducto) {
    setModo('editar');
    setEditing(producto);
    setNotice('');
    setActionError('');
  }

  function handleCloseForm() {
    setModo(null);
    setEditing(null);
    setActionError('');
  }

  async function handleSaveProduct(data: CrearProductoAdmin | ActualizarProductoAdmin) {
    if ('stockInicial' in data) {
      await crear.mutateAsync(data);
      setNotice('Producto creado correctamente.');
    } else if (modo === 'editar' && editing) {
      await actualizar.mutateAsync({ id: editing.id, data });
      setNotice('Producto actualizado correctamente.');
    } else {
      throw new Error('No se pudo determinar la operación para guardar el producto.');
    }
    handleCloseForm();
  }

  async function handleDeactivate(producto: AdminProducto) {
    if (
      !window.confirm(
        `¿Desactivar "${producto.nombre}"? Esta acción no se puede deshacer desde aquí.`,
      )
    ) {
      return;
    }
    setNotice('');
    setActionError('');
    try {
      await darDeBaja.mutateAsync(producto.id);
      setNotice('Producto desactivado correctamente.');
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  }

  function handleChangePage(page: number) {
    setFilters((current) => ({ ...current, page }));
  }

  function handleCloseDetails() {
    setDetailId(null);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Productos</h1>
          <p className="mt-2 text-slate-600">
            Gestioná productos y sus relaciones con marcas, tipos y proveedores.
          </p>
        </div>
        {modo === null && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
          >
            Crear producto
          </button>
        )}
      </div>

      {notice && (
        <AdminBanner tone="success" className="mb-5">
          {notice}
        </AdminBanner>
      )}
      {actionError && (
        <AdminBanner tone="error" className="mb-5">
          {actionError}
        </AdminBanner>
      )}

      {modo !== null && (
        <ProductoForm
          key={editing?.id ?? 'new'}
          producto={editing}
          marcas={marcas}
          tipos={tipos}
          proveedores={proveedores}
          mastersReady={mastersReady}
          onCancel={handleCloseForm}
          onSave={handleSaveProduct}
        />
      )}

      {(marcasQuery.isError || tiposQuery.isError || proveedoresQuery.isError) && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <p>No se pudieron cargar todas las opciones de relaciones:</p>
          <ul className="mt-2 list-inside list-disc text-sm">
            {marcasQuery.isError && <li>Marcas: {getApiErrorMessage(marcasQuery.error)}</li>}
            {tiposQuery.isError && <li>Tipos: {getApiErrorMessage(tiposQuery.error)}</li>}
            {proveedoresQuery.isError && (
              <li>Proveedores: {getApiErrorMessage(proveedoresQuery.error)}</li>
            )}
          </ul>
        </div>
      )}

      <ProductoFiltersForm
        tipos={tipos}
        marcas={marcas}
        proveedores={proveedores}
        marcasQuery={marcasQuery}
        tiposQuery={tiposQuery}
        proveedoresQuery={proveedoresQuery}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {productos.isLoading ? (
        <p role="status" className="py-12 text-center text-slate-600">
          Cargando productos...
        </p>
      ) : productos.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p>No se pudo cargar el listado: {getApiErrorMessage(productos.error)}</p>
          <button
            type="button"
            onClick={() => void productos.refetch()}
            className="mt-3 rounded-full border border-red-300 px-4 py-2 font-semibold"
          >
            Reintentar
          </button>
        </div>
      ) : productos.data?.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-semibold text-slate-800">No hay productos para estos filtros.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Producto</th>
                  <th className="px-5 py-4 font-bold">Tipo</th>
                  <th className="px-5 py-4 font-bold">Marca</th>
                  <th className="px-5 py-4 font-bold">Precio</th>
                  <th className="px-5 py-4 font-bold">Stock</th>
                  <th className="px-5 py-4 font-bold">Estado</th>
                  <th className="px-5 py-4 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.data?.data.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{producto.nombre}</td>
                    <td className="px-5 py-4 text-slate-700">{producto.tipoProducto.nombre}</td>
                    <td className="px-5 py-4 text-slate-700">{producto.marca.nombre}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {formatMoney(producto.precioUnitario)}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{producto.stock}</td>
                    <td className="px-5 py-4">
                      <EstadoBadge activo={producto.activo} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailId(producto.id)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(producto)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageProduct(producto)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700"
                        >
                          Imágenes
                        </button>
                        {producto.activo && (
                          <button
                            type="button"
                            onClick={() => void handleDeactivate(producto)}
                            disabled={darDeBaja.isPending}
                            className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 disabled:opacity-60"
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
              {productos.data?.total ?? 0}{' '}
              {(productos.data?.total ?? 0) === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <nav aria-label="Paginación de productos" className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => handleChangePage(filters.page - 1)}
              disabled={filters.page <= 1}
              className="rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-700 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="self-center text-sm text-slate-600">
              Página {filters.page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handleChangePage(filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-700 disabled:opacity-40"
            >
              Siguiente
            </button>
          </nav>
        </>
      )}

      {detailId !== null && (
        <ProductoDetalleModal detalle={detalle} onClose={handleCloseDetails} />
      )}

      {imageProduct && (
        <ProductoImagenesPanel producto={imageProduct} onClose={() => setImageProduct(null)} />
      )}
    </section>
  );
}
