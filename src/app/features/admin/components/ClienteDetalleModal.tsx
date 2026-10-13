import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { AdminModal } from '../../../shared/components/AdminModal';
import type { AdminCliente } from '../../../models/AdminCliente';

interface DetalleCliente {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data?: AdminCliente;
}

interface ClienteDetalleModalProps {
  detalle: DetalleCliente;
  onClose: () => void;
}

export function ClienteDetalleModal({ detalle, onClose }: ClienteDetalleModalProps) {
  const cliente = detalle.data;
  return (
    <AdminModal labelledBy="cliente-detail-title" onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <h2 id="cliente-detail-title" className="text-xl font-bold text-slate-950">
          Detalle del cliente
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
      ) : cliente ? (
        <dl className="mt-5 space-y-3">
          {[
            ['Nombre', cliente.nombre],
            ['Email', cliente.email],
            ['Teléfono', cliente.telefono],
            ['Dirección', cliente.direccion],
            ['Estado', cliente.activo ? 'Activo' : 'Inactivo'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-1 text-slate-900">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </AdminModal>
  );
}
