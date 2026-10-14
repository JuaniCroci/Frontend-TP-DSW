import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { formatMoney } from '../../../shared/utils/formatMoney';
import { PedidoDetallePanel } from '../components/PedidoDetallePanel';
import { useMiPedidoDetalle, useMisPedidos } from '../api/queries';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export default function MisPedidosPage() {
  const pedidos = useMisPedidos();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const detalle = useMiPedidoDetalle(selectedId);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:py-14">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">Tu cuenta</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Mis pedidos</h1>
      <p className="mt-3 text-slate-600">
        Consultá el estado y el detalle de los pedidos que realizaste.
      </p>

      {pedidos.isLoading ? (
        <p role="status" className="py-12 text-center text-slate-600">
          Cargando tus pedidos...
        </p>
      ) : pedidos.isError ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"
        >
          <p>No se pudieron cargar tus pedidos: {getApiErrorMessage(pedidos.error)}</p>
          <button
            type="button"
            onClick={() => void pedidos.refetch()}
            className="mt-3 rounded-full border border-red-300 px-4 py-2 font-semibold"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {selectedId !== null &&
            (detalle.isLoading ? (
              <p role="status" className="mt-6 rounded-xl bg-white p-5 text-slate-600">
                Cargando detalle...
              </p>
            ) : detalle.isError ? (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"
              >
                <p>No se pudo cargar el pedido: {getApiErrorMessage(detalle.error)}</p>
                <button
                  type="button"
                  onClick={() => void detalle.refetch()}
                  className="mt-3 rounded-full border border-red-300 px-4 py-2 font-semibold"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              detalle.data && (
                <div className="mt-6">
                  <PedidoDetallePanel pedido={detalle.data} onClose={() => setSelectedId(null)} />
                </div>
              )
            ))}

          {pedidos.data?.data.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="font-semibold text-slate-800">Todavía no realizaste pedidos.</p>
              <Link
                to="/productos"
                className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
              >
                Ir al catálogo
              </Link>
            </div>
          ) : (
            <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold">Pedido</th>
                    <th className="px-5 py-4 font-bold">Realizado</th>
                    <th className="px-5 py-4 font-bold">Estado</th>
                    <th className="px-5 py-4 font-bold">Total</th>
                    <th className="px-5 py-4 text-right font-bold">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pedidos.data?.data.map((pedido) => (
                    <tr key={pedido.id}>
                      <td className="px-5 py-4 font-semibold text-slate-900">#{pedido.id}</td>
                      <td className="px-5 py-4 text-slate-700">{formatDate(pedido.fecha)}</td>
                      <td className="px-5 py-4 text-slate-700">{pedido.estado}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatMoney(pedido.importeTotal)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedId(pedido.id)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
                {pedidos.data?.total ?? 0} {(pedidos.data?.total ?? 0) === 1 ? 'pedido' : 'pedidos'}
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
