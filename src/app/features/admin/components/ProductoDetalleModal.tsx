import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { AdminModal } from '../../../shared/components/AdminModal';
import { formatMoney } from '../../../shared/utils/formatMoney';
import type { AdminProducto } from '../../../models/AdminProducto';

interface DetalleProducto {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data?: AdminProducto;
}

interface ProductoDetalleModalProps {
  detalle: DetalleProducto;
  onClose: () => void;
}

export function ProductoDetalleModal({ detalle, onClose }: ProductoDetalleModalProps) {
  const producto = detalle.data;
  return (
    <AdminModal labelledBy="admin-product-detail-title" onClose={onClose} panelClassName="max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <h2 id="admin-product-detail-title" className="text-xl font-bold text-slate-950">
          Detalle del producto
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>
      {detalle.isLoading ? (
        <p role="status" className="py-8 text-slate-600">
          Cargando detalle...
        </p>
      ) : detalle.isError ? (
        <p role="alert" className="py-8 text-red-700">
          {getApiErrorMessage(detalle.error)}
        </p>
      ) : producto ? (
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</dt>
            <dd className="mt-1 text-slate-900">{producto.nombre}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Estado</dt>
            <dd className="mt-1 text-slate-900">{producto.activo ? 'Activo' : 'Inactivo'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Tipo</dt>
            <dd className="mt-1 text-slate-900">{producto.tipoProducto.nombre}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Marca</dt>
            <dd className="mt-1 text-slate-900">{producto.marca.nombre}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Precio</dt>
            <dd className="mt-1 text-slate-900">{formatMoney(producto.precioUnitario)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Stock actual
            </dt>
            <dd className="mt-1 text-slate-900">{producto.stock}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Proveedor</dt>
            <dd className="mt-1 text-slate-900">
              {producto.proveedor?.razonSocial ?? 'Sin proveedor'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Descripción
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-slate-900">
              {producto.descripcion || '—'}
            </dd>
          </div>
        </dl>
      ) : null}
    </AdminModal>
  );
}
