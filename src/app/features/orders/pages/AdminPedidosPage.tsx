import { useState } from 'react';
import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { useCancelarPedido, useEntregarPedido } from '../api/mutations';
import { useAdminPedidoDetalle, useAdminPedidos } from '../api/queries';
import type { EstadoPedido, FiltrosPedidosAdmin } from '../../../models/Pedido';
import { formatMoney } from '../../../shared/utils/formatMoney';
import { PedidoDetallePanel } from '../components/PedidoDetallePanel';

const PAGE_SIZE = 20;

const estados: Array<{ value: EstadoPedido | ''; label: string }> = [
  { value: '', label: 'Todos los estados' },
  { value: 'REALIZADO', label: 'Realizado' },
  { value: 'ABONADO', label: 'Abonado' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

const initialFilters: FiltrosPedidosAdmin = {
  desde: '',
  hasta: '',
  estado: '',
  cliente: '',
  page: 1,
  size: PAGE_SIZE,
};

export default function AdminPedidosPage() {
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const pedidos = useAdminPedidos(filters);
  const detalle = useAdminPedidoDetalle(selectedId);
  const entregar = useEntregarPedido();
  const cancelar = useCancelarPedido();
  const isActionPending = entregar.isPending || cancelar.isPending;
  const currentPage = pedidos.data?.page ?? filters.page;
  const pageCount = Math.max(1, Math.ceil((pedidos.data?.total ?? 0) / filters.size));

  function handleApplyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setActionError('');
    setFilters({ ...draft, page: 1, size: PAGE_SIZE });
  }

  function handleClearFilters() {
    setDraft(initialFilters);
    setFilters(initialFilters);
    setNotice('');
    setActionError('');
  }

  async function handleTransition(id: number, action: 'entregar' | 'cancelar') {
    const description =
      action === 'entregar'
        ? `¿Marcar el pedido #${id} como entregado?`
        : `¿Cancelar el pedido #${id}? Esta acción puede restituir el stock.`;
    if (!window.confirm(description)) return;

    setNotice('');
    setActionError('');
    try {
      if (action === 'entregar') {
        await entregar.mutateAsync(id);
        setNotice(`El pedido #${id} se marcó como entregado.`);
      } else {
        await cancelar.mutateAsync(id);
        setNotice(`El pedido #${id} se canceló correctamente.`);
      }
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Pedidos</h1>
        <p className="mt-2 text-slate-600">
          Buscá pedidos, revisá sus detalles y gestioná entregas o cancelaciones.
        </p>
      </div>

      {notice && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
        >
          {notice}
        </p>
      )}
      {actionError && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {actionError}
        </p>
      )}

      <form
        onSubmit={handleApplyFilters}
        className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-sm font-semibold text-slate-700">
          Desde
          <input
            type="date"
            value={draft.desde}
            onChange={(event) => setDraft({ ...draft, desde: event.target.value })}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Hasta
          <input
            type="date"
            value={draft.hasta}
            onChange={(event) => setDraft({ ...draft, hasta: event.target.value })}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Estado
          <select
            value={draft.estado}
            onChange={(event) =>
              setDraft({ ...draft, estado: event.target.value as EstadoPedido | '' })
            }
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
          >
            {estados.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Nombre o email del cliente
          <input
            type="search"
            value={draft.cliente}
            onChange={(event) => setDraft({ ...draft, cliente: event.target.value })}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
          />
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <button
            type="submit"
            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-lime-700"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Limpiar
          </button>
        </div>
      </form>

      {selectedId !== null &&
        (detalle.isLoading ? (
          <p role="status" className="mb-6 rounded-xl bg-white p-5 text-slate-600">
            Cargando detalle...
          </p>
        ) : detalle.isError ? (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"
          >
            <p>No se pudo cargar el pedido: {getApiErrorMessage(detalle.error)}</p>
            <button
              type="button"
              onClick={() => void detalle.refetch()}
              className="mt-3 rounded-full border border-red-300 px-4 py-2 font-semibold"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="ml-2 mt-3 rounded-full border border-red-300 px-4 py-2 font-semibold"
            >
              Cerrar
            </button>
          </div>
        ) : (
          detalle.data && (
            <div className="mb-6">
              <PedidoDetallePanel pedido={detalle.data} admin onClose={() => setSelectedId(null)} />
            </div>
          )
        ))}

      {pedidos.isLoading ? (
        <p role="status" className="py-12 text-center text-slate-600">
          Cargando pedidos...
        </p>
      ) : pedidos.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p>No se pudo cargar el listado: {getApiErrorMessage(pedidos.error)}</p>
          <button
            type="button"
            onClick={() => void pedidos.refetch()}
            className="mt-3 rounded-full border border-red-300 px-4 py-2 font-semibold"
          >
            Reintentar
          </button>
        </div>
      ) : pedidos.data?.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-semibold text-slate-800">No hay pedidos para estos filtros.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-bold">Pedido</th>
                <th className="px-5 py-4 font-bold">Realizado</th>
                <th className="px-5 py-4 font-bold">Cliente</th>
                <th className="px-5 py-4 font-bold">Entrega</th>
                <th className="px-5 py-4 font-bold">Estado</th>
                <th className="px-5 py-4 font-bold">Total</th>
                <th className="px-5 py-4 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedidos.data?.data.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="px-5 py-4 font-semibold text-slate-900">#{pedido.id}</td>
                  <td className="px-5 py-4 text-slate-700">{formatDate(pedido.fecha)}</td>
                  <td className="px-5 py-4 text-slate-700">
                    <span className="block font-semibold">{pedido.usuario.nombre}</span>
                    <span className="text-xs text-slate-500">{pedido.usuario.email}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {pedido.fechaEntrega ? formatDate(pedido.fechaEntrega) : '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-700">{pedido.estado}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {formatMoney(pedido.importeTotal)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(pedido.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Ver
                      </button>
                      {pedido.estado === 'REALIZADO' && (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleTransition(pedido.id, 'entregar')}
                            disabled={isActionPending}
                            className="rounded-lg border border-green-200 px-3 py-1.5 font-semibold text-green-800 hover:bg-green-50 disabled:opacity-60"
                          >
                            Entregar
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleTransition(pedido.id, 'cancelar')}
                            disabled={isActionPending}
                            className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
            <span>
              {pedidos.data?.total ?? 0} {(pedidos.data?.total ?? 0) === 1 ? 'pedido' : 'pedidos'} ·
              Página {currentPage} de {pageCount}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
                disabled={currentPage <= 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
                disabled={currentPage >= pageCount}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
