import type { FormEvent } from 'react';
import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { AdminModal } from '../../../shared/components/AdminModal';
import type { DetalleAdminDescuento } from '../../../models/AdminDescuento';

interface DetalleDescuento {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data?: DetalleAdminDescuento;
}

interface EstadoProductos {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data?: Array<{ id: number; nombre: string; activo: boolean }>;
}

interface AplicacionesDescuentoModalProps {
  detalle: DetalleDescuento;
  productos: EstadoProductos;
  applicationError: string;
  isCreatingApplication: boolean;
  isRemovingApplication: boolean;
  onAddApplication: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveApplication: (aplicacionId: number, nombreProducto: string) => void;
  onClose: () => void;
}

function fechaCorta(value: string): string {
  return value.slice(0, 10);
}

export function AplicacionesDescuentoModal({
  detalle,
  productos,
  applicationError,
  isCreatingApplication,
  isRemovingApplication,
  onAddApplication,
  onRemoveApplication,
  onClose,
}: AplicacionesDescuentoModalProps) {
  const descuento = detalle.data;
  return (
    <AdminModal
      labelledBy="descuento-aplicaciones-title"
      onClose={onClose}
      panelClassName="max-h-[90vh] max-w-3xl overflow-y-auto"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-lime-700">
            Aplicaciones por producto
          </p>
          <h2 id="descuento-aplicaciones-title" className="mt-1 text-xl font-bold text-slate-950">
            {detalle.data?.descripcion ?? 'Descuento'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar aplicaciones"
          className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      {detalle.isLoading ? (
        <p role="status" className="py-8 text-slate-600">
          Cargando aplicaciones...
        </p>
      ) : detalle.isError ? (
        <p role="alert" className="py-8 text-red-700">
          {getApiErrorMessage(detalle.error)}
        </p>
      ) : descuento ? (
        <>
          {descuento.aplicaciones.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              Este descuento todavía no está asociado a ningún producto.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">Producto</th>
                    <th className="px-4 py-3 font-bold">Desde</th>
                    <th className="px-4 py-3 font-bold">Hasta</th>
                    <th className="px-4 py-3 text-right font-bold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {descuento.aplicaciones.map((aplicacion) => (
                    <tr key={aplicacion.id}>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {aplicacion.producto.nombre}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {fechaCorta(aplicacion.fechaDesde)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {fechaCorta(aplicacion.fechaHasta)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            onRemoveApplication(aplicacion.id, aplicacion.producto.nombre)
                          }
                          disabled={isRemovingApplication}
                          className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {descuento.activo && (
            <form onSubmit={(event) => onAddApplication(event)} className="mt-6 rounded-xl bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">Aplicar a un producto</h3>
              {applicationError && (
                <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  {applicationError}
                </p>
              )}
              {productos.isError ? (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  No se pudieron cargar los productos: {getApiErrorMessage(productos.error)}
                </p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label className="text-sm font-semibold text-slate-700 sm:col-span-3">
                    Producto activo
                    <select
                      name="idProducto"
                      required
                      defaultValue=""
                      disabled={productos.isLoading || productos.data?.length === 0}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
                    >
                      <option value="" disabled>
                        {productos.isLoading ? 'Cargando productos...' : 'Seleccioná un producto'}
                      </option>
                      {productos.data?.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Vigente desde
                    <input
                      name="fechaDesde"
                      type="date"
                      required
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Vigente hasta
                    <input
                      name="fechaHasta"
                      type="date"
                      required
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={
                        isCreatingApplication ||
                        productos.isLoading ||
                        productos.data?.length === 0
                      }
                      className="w-full rounded-full bg-slate-950 px-4 py-2.5 font-bold text-white enabled:hover:bg-lime-700 disabled:opacity-50"
                    >
                      {isCreatingApplication ? 'Aplicando...' : 'Aplicar descuento'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </>
      ) : null}
    </AdminModal>
  );
}
