import { Link, useLocation, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useAgregarAlCarrito } from '../../cart/api/mutations';
import { useProductoDetalle } from '../api/queries';
import ProductoImagen from '../components/ProductoImagen';

function formatPrice(value: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(Number(value));
}

export default function ProductoDetallePage() {
  const { id } = useParams();
  const location = useLocation();
  const productoId = Number(id);
  const producto = useProductoDetalle(productoId);
  const { isAuthenticated, user } = useAuth();
  const agregar = useAgregarAlCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [cartNotice, setCartNotice] = useState('');
  const [cartError, setCartError] = useState('');
  const backToCatalog = `/productos${location.search}`;
  const loginReturn = `${location.pathname}${location.search}`;

  async function addToCart() {
    if (!producto.data) return;
    setCartError('');
    setCartNotice('');
    try {
      await agregar.mutateAsync({ idProducto: producto.data.id, cantidad });
      setCartNotice('Producto agregado al carrito.');
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'No se pudo agregar el producto.');
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:py-16">
      <Link to={backToCatalog} className="font-semibold text-slate-600 hover:text-lime-700">
        ← Volver al catálogo
      </Link>

      {producto.isLoading ? (
        <p role="status" className="py-20 text-center text-slate-600">
          Cargando producto...
        </p>
      ) : producto.isError || !producto.data ? (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
        >
          <h1 className="text-xl font-bold">No pudimos cargar este producto.</h1>
          <p className="mt-2">{producto.error?.message ?? 'El producto no está disponible.'}</p>
        </div>
      ) : (
        <article className="mt-8 grid gap-10 lg:grid-cols-2">
          <ProductoImagen
            imagen={producto.data.imagenPrincipal}
            className="flex min-h-80 items-center justify-center rounded-3xl bg-slate-100"
            imageClassName="max-h-[32rem] w-full rounded-3xl object-contain"
          />
          <div className="py-2">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">
              {producto.data.tipoProducto.nombre} · {producto.data.marca.nombre}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              {producto.data.nombre}
            </h1>
            <p className="mt-5 text-3xl font-black text-slate-950">
              {formatPrice(producto.data.precioUnitario)}
            </p>
            <p
              className={`mt-3 font-semibold ${
                producto.data.disponible ? 'text-green-700' : 'text-slate-500'
              }`}
            >
              {producto.data.disponible
                ? `${producto.data.stock} unidades disponibles`
                : 'Sin stock'}
            </p>

            {user?.rol === 'CLIENTE' ? (
              <div className="mt-6">
                <label className="block max-w-xs text-sm font-semibold text-slate-700">
                  Cantidad
                  <input
                    type="number"
                    min="1"
                    max={producto.data.stock}
                    step="1"
                    value={cantidad}
                    onChange={(event) => setCantidad(Number(event.target.value))}
                    disabled={!producto.data.disponible || agregar.isPending}
                    className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void addToCart()}
                  disabled={
                    !producto.data.disponible ||
                    agregar.isPending ||
                    !Number.isInteger(cantidad) ||
                    cantidad < 1 ||
                    cantidad > producto.data.stock
                  }
                  className="mt-4 rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white enabled:hover:bg-lime-700 disabled:opacity-50"
                >
                  {agregar.isPending ? 'Agregando...' : 'Agregar al carrito'}
                </button>
                {cartNotice && (
                  <p role="status" className="mt-3 text-sm font-semibold text-green-700">
                    {cartNotice}{' '}
                    <Link to="/carrito" className="underline underline-offset-2">
                      Ver carrito
                    </Link>
                  </p>
                )}
                {cartError && (
                  <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
                    {cartError}
                  </p>
                )}
              </div>
            ) : !isAuthenticated ? (
              <Link
                to="/login"
                state={{ from: loginReturn }}
                className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
              >
                Iniciá sesión para comprar
              </Link>
            ) : null}

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="font-bold text-slate-950">Descripción</h2>
              <p className="mt-2 whitespace-pre-line leading-7 text-slate-600">
                {producto.data.descripcion || 'Este producto no tiene una descripción disponible.'}
              </p>
            </div>

            {producto.data.descuentosVigentes.length > 0 && (
              <section aria-labelledby="descuentos-titulo" className="mt-8">
                <h2 id="descuentos-titulo" className="font-bold text-slate-950">
                  Descuentos vigentes
                </h2>
                <ul className="mt-3 space-y-2">
                  {producto.data.descuentosVigentes.map((descuento) => (
                    <li
                      key={descuento.id}
                      className="rounded-xl bg-lime-50 p-4 text-sm text-slate-800"
                    >
                      <span className="font-bold">{descuento.porcentaje}%</span> ·{' '}
                      {descuento.descripcion} (desde {descuento.cantidadMinima}{' '}
                      {descuento.cantidadMinima === 1 ? 'unidad' : 'unidades'})
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>
      )}
    </main>
  );
}
