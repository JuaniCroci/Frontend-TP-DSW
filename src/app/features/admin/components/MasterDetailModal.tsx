import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { AdminModal } from '../../../shared/components/AdminModal';
import type { RegistroCatalogo } from '../../../models/AdminCatalogo';
import type { CampoMaestro } from '../campoMaestro';
import { valueFor } from '../valueFor';

interface DetalleCatalogo {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data?: RegistroCatalogo;
}

interface MasterDetailModalProps {
  detail: DetalleCatalogo;
  fields: CampoMaestro[];
  onClose: () => void;
}

export function MasterDetailModal({ detail, fields, onClose }: MasterDetailModalProps) {
  const registro = detail.data;
  return (
    <AdminModal labelledBy="admin-detail-title" onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <h2 id="admin-detail-title" className="text-xl font-bold text-slate-950">
          Detalle
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
      {detail.isLoading ? (
        <p role="status" className="py-8 text-slate-600">
          Cargando detalle...
        </p>
      ) : detail.isError ? (
        <p role="alert" className="py-8 text-red-700">
          {getApiErrorMessage(detail.error)}
        </p>
      ) : registro ? (
        <dl className="mt-5 space-y-3">
          {fields.map((field) => (
            <div key={field.name}>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {field.label}
              </dt>
              <dd className="mt-1 text-slate-900">{valueFor(registro, field.name) || '—'}</dd>
            </div>
          ))}
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Estado</dt>
            <dd className="mt-1 text-slate-900">{registro.activo ? 'Activo' : 'Inactivo'}</dd>
          </div>
        </dl>
      ) : null}
    </AdminModal>
  );
}
