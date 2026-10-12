import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../../core/api/apiError';
import type { PedidoConfirmado } from '../../../models/Carrito';
import {
  useActualizarItemCarrito,
  useConfirmarCarrito,
  useQuitarItemCarrito,
} from '../api/mutations';
import { useCarrito } from '../api/queries';

function formatPrice(value: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

function isMissingCart(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 404;
}

export default function CarritoPage() {
  const carrito = useCarrito();
  const actualizar = useActualizarItemCarrito();
  const quitar = useQuitarItemCarrito();
  const confirmar = useConfirmarCarrito();
  const [pedido, setPedido] = useState<PedidoConfirmado | null>(null);
  const [actionError, setActionError] = useState('');

  async function handleUpdateQuantity(event: React.FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    setActionError('');
    const formData = new FormData(event.currentTarget);
    const cantidad = Number(formData.get('cantidad'));
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setActionError('La cantidad debe ser un entero de al menos 1.');
      return;
    }

    try {
      await actualizar.mutateAsync({ id, cantidad });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  async function handleRemoveItem(id: number, name: string) {
    if (!window.confirm(`¿Quitar "${name}" del carrito?`)) return;
    setActionError('');
    try {
      await quitar.mutateAsync(id);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  async function handleConfirmOrder() {
    if (!window.confirm('Se confirmará el pedido. El pago no se procesa en esta etapa.')) return;
    setActionError('');
    try {
      setPedido(await confirmar.mutateAsync());
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:py-16">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">Tu compra</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
        {pedido ? 'Pedido confirmado' : 'Carrito'}
      </h1>

      {pedido ? (
        <section className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-xl font-bold text-green-900">¡Listo! Registramos tu pedido.</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-green-800">Número de pedido</dt>
              <dd className="mt-1 text-green-950">#{pedido.id}</dd>
            </div>
            <div>
              <dt className="font-semibold text-green-800">Estado</dt>
              <dd className="mt-1 text-green-950">{pedido.estado}</dd>
            </div>
            <div>
              <dt className="font-semibold text-green-800">Total confirmado</dt>
              <dd className="mt-1 text-green-950">{formatPrice(pedido.importeTotal)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-green-900">
            El pedido quedó registrado, pero todavía no se realizó ningún pago.
          </p>
          <ul className="mt-5 divide-y divide-green-200 rounded-xl bg-white">
            {pedido.items.map((item) => (
              <li key={item.id} className="flex flex-wrap justify-between gap-2 p-4 text-sm">
                <span>
                  <strong>{item.producto.nombre}</strong> · {item.cantidad} unidades
                  {Number(item.descuentoAplicado ?? 0) > 0 && (
                    <span className="ml-2 text-lime-800">
                      ({item.descuentoAplicado}% de descuento)
                    </span>
                  )}
                </span>
                <span className="font-bold">{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/productos"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
          >
            Volver al catálogo
          </Link>
        </section>
      ) : (
        <>
          <p className="mt-3 text-slate-600">
            Revisá los productos y cantidades antes de confirmar tu pedido.
          </p>
          {actionError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
            >
              {actionError}
            </p>
          )}

          {carrito.isLoading ? (
            <p role="status" className="py-16 text-center text-slate-600">
              Cargando carrito...
            </p>
          ) : carrito.isError && !isMissingCart(carrito.error) ? (
            <div
              role="alert"
              className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
            >
              <p>No pudimos cargar el carrito: {getErrorMessage(carrito.error)}</p>
              <button
                type="button"
                onClick={() => void carrito.refetch()}
                className="mt-4 rounded-full border border-red-300 px-4 py-2 font-semibold"
              >
                Reintentar
              </button>
            </div>
          ) : carrito.data?.items.length === 0 || isMissingCart(carrito.error) ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <h2 className="text-xl font-bold text-slate-900">Tu carrito está vacío</h2>
              <p className="mt-2 text-slate-600">
                Explorá el catálogo y agregá productos para empezar.
              </p>
              <Link
                to="/productos"
                className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
              >
                Ir al catálogo
              </Link>
            </div>
          ) : carrito.data ? (
            <>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-bold">Producto</th>
                      <th className="px-5 py-4 font-bold">Precio unitario</th>
                      <th className="px-5 py-4 font-bold">Cantidad</th>
                      <th className="px-5 py-4 font-bold">Subtotal</th>
                      <th className="px-5 py-4 text-right font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {carrito.data.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {item.producto.nombre}
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {formatPrice(item.producto.precioUnitario)}
                        </td>
                        <td className="px-5 py-4">
                          <form
                            className="flex items-center gap-2"
                            onSubmit={(event) => void handleUpdateQuantity(event, item.id)}
                          >
                            <label className="sr-only" htmlFor={`cantidad-${item.id}`}>
                              Cantidad de {item.producto.nombre}
                            </label>
                            <input
                              id={`cantidad-${item.id}`}
                              name="cantidad"
                              type="number"
                              min="1"
                              step="1"
                              required
                              defaultValue={item.cantidad}
                              className="w-20 rounded-lg border border-slate-300 px-2 py-1.5"
                            />
                            <button
                              type="submit"
                              disabled={actualizar.isPending}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-50"
                            >
                              Actualizar
                            </button>
                          </form>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {formatPrice(item.subtotal)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => void handleRemoveItem(item.id, item.producto.nombre)}
                            disabled={quitar.isPending}
                            className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col items-end gap-4">
                <p className="text-xl font-black text-slate-950">
                  Total: {formatPrice(carrito.data.total)}
                </p>
                <p className="max-w-lg text-right text-sm text-slate-600">
                  Los descuentos aplicables y el total final del pedido se calcularán al
                  confirmarlo. Esta acción no procesa el pago.
                </p>
                <button
                  type="button"
                  onClick={() => void handleConfirmOrder()}
                  disabled={confirmar.isPending || carrito.data.items.length === 0}
                  className="rounded-full bg-lime-300 px-6 py-3 font-bold text-slate-950 hover:bg-lime-400 disabled:opacity-50"
                >
                  {confirmar.isPending ? 'Confirmando pedido...' : 'Confirmar pedido'}
                </button>
              </div>
            </>
          ) : null}
        </>
      )}
    </main>
  );
}
