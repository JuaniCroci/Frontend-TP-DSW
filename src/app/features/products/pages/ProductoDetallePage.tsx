import { Link, useLocation, useParams } from 'react-router-dom';
import { cn } from '../../../shared/utils/cn';
import { AgregarAlCarrito } from '../../cart/components/AgregarAlCarrito';
import { useProductoDetalle } from '../api/queries';
import { ProductoImagen } from '../components/ProductoImagen';
import { formatMoney } from '../../../shared/utils/formatMoney';

export default function ProductoDetallePage() {
  const { id } = useParams();
  const location = useLocation();
  const productoId = Number(id);
  const producto = useProductoDetalle(productoId);
  const backToCatalog = `/productos${location.search}`;
  const loginReturn = `${location.pathname}${location.search}`;

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
              {formatMoney(producto.data.precioUnitario)}
            </p>
            <p
              className={cn(
                'mt-3 font-semibold',
                producto.data.disponible ? 'text-green-700' : 'text-slate-500',
              )}
            >
              {producto.data.disponible
                ? `${producto.data.stock} unidades disponibles`
                : 'Sin stock'}
            </p>

            <AgregarAlCarrito
              productoId={producto.data.id}
              stock={producto.data.stock}
              disponible={producto.data.disponible}
              loginReturn={loginReturn}
            />

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
