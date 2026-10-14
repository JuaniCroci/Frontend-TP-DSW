import type { PedidoDetalle } from '../../../models/Pedido';
import { formatMoney } from '../../../shared/utils/formatMoney';

const estadoStyles = {
  REALIZADO: 'bg-amber-50 text-amber-800',
  ABONADO: 'bg-blue-50 text-blue-800',
  ENTREGADO: 'bg-green-50 text-green-800',
  CANCELADO: 'bg-slate-100 text-slate-600',
} satisfies Record<PedidoDetalle['estado'], string>;

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

interface PedidoDetallePanelProps {
  pedido: PedidoDetalle;
  onClose: () => void;
  admin?: boolean;
}

export function PedidoDetallePanel({ pedido, onClose, admin = false }: PedidoDetallePanelProps) {
  return (
    <section
      role="dialog"
      aria-labelledby="pedido-detalle-title"
      className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-lime-700">
            Detalle del pedido
          </p>
          <h2 id="pedido-detalle-title" className="mt-1 text-2xl font-black text-slate-950">
            Pedido #{pedido.id}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cerrar detalle
        </button>
      </div>

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-semibold text-slate-500">Realizado</dt>
          <dd className="mt-1 text-slate-900">{formatDate(pedido.fecha)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Estado</dt>
          <dd className="mt-1">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${estadoStyles[pedido.estado]}`}
            >
              {pedido.estado}
            </span>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Fecha de entrega</dt>
          <dd className="mt-1 text-slate-900">{formatDate(pedido.fechaEntrega)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Importe total</dt>
          <dd className="mt-1 font-bold text-slate-950">{formatMoney(pedido.importeTotal)}</dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.7fr)]">
        <div>
          <h3 className="font-bold text-slate-950">Productos</h3>
          {pedido.items.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Este pedido no tiene líneas.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {pedido.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-3 p-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.producto.nombre}</p>
                    <p className="mt-1 text-slate-600">
                      {item.cantidad} × {formatMoney(item.precioUnitario)}
                      {item.descuentoAplicado && Number(item.descuentoAplicado) > 0
                        ? ` · ${item.descuentoAplicado}% de descuento`
                        : ''}
                    </p>
                  </div>
                  <p className="font-bold text-slate-950">{formatMoney(item.subtotal)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="font-bold text-slate-950">Cliente</h3>
          <dl className="mt-3 space-y-3 rounded-xl border border-slate-200 p-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Nombre</dt>
              <dd className="mt-1 text-slate-900">{pedido.usuario.nombre}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Email</dt>
              <dd className="mt-1 break-all text-slate-900">{pedido.usuario.email}</dd>
            </div>
            {admin && (
              <>
                <div>
                  <dt className="font-semibold text-slate-500">Teléfono</dt>
                  <dd className="mt-1 text-slate-900">{pedido.usuario.telefono || '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Dirección</dt>
                  <dd className="mt-1 text-slate-900">{pedido.usuario.direccion || '—'}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}
