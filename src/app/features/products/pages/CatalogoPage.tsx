import { useSearchParams, Link } from 'react-router-dom';
import { useMarcasCatalogo, useProductos, useTiposProductoCatalogo } from '../api/queries';
import type { FiltrosProducto } from '../../../models/Producto';

const PAGE_SIZE = 12;

function parsePositiveInteger(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parsePrice(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseOrder(value: string | null): FiltrosProducto['orden'] {
  return value === 'nombre' || value === 'precio' ? value : undefined;
}

function formatPrice(value: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function describeError(error: Error | null, fallback: string): string {
  return error?.message ?? fallback;
}

export default function CatalogoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters: FiltrosProducto = {
    idTipoProducto: parsePositiveInteger(searchParams.get('idTipoProducto')),
    idMarca: parsePositiveInteger(searchParams.get('idMarca')),
    precioMin: parsePrice(searchParams.get('precioMin')),
    precioMax: parsePrice(searchParams.get('precioMax')),
    orden: parseOrder(searchParams.get('orden')),
    dir:
      searchParams.get('dir') === 'desc'
        ? 'desc'
        : searchParams.get('dir') === 'asc'
          ? 'asc'
          : undefined,
    page: parsePositiveInteger(searchParams.get('page')) ?? 1,
    size: PAGE_SIZE,
  };
  const productos = useProductos(filters);
  const marcas = useMarcasCatalogo();
  const tipos = useTiposProductoCatalogo();

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextParams = new URLSearchParams();

    for (const key of ['idTipoProducto', 'idMarca', 'precioMin', 'precioMax'] as const) {
      const value = String(formData.get(key) ?? '').trim();
      if (value) nextParams.set(key, value);
    }

    const orden = String(formData.get('orden') ?? '');
    const dir = String(formData.get('dir') ?? '');
    if (orden === 'nombre' || orden === 'precio') nextParams.set('orden', orden);
    if (dir === 'asc' || dir === 'desc') nextParams.set('dir', dir);
    setSearchParams(nextParams);
  }

  function changePage(page: number) {
    const nextParams = new URLSearchParams(searchParams);
    if (page === 1) nextParams.delete('page');
    else nextParams.set('page', String(page));
    setSearchParams(nextParams);
  }

  const totalPages = Math.max(1, Math.ceil((productos.data?.total ?? 0) / PAGE_SIZE));

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-700">La tienda</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Catálogo</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Explorá productos para acompañar tu entrenamiento y encontrá lo que mejor se adapta a tus
          objetivos.
        </p>
      </div>

      <form
        key={searchParams.toString()}
        onSubmit={applyFilters}
        className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-6"
      >
        <label className="text-sm font-semibold text-slate-700">
          Tipo de producto
          <select
            name="idTipoProducto"
            defaultValue={searchParams.get('idTipoProducto') ?? ''}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            disabled={tipos.isLoading}
          >
            <option value="">Todos los tipos</option>
            {tipos.data?.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Marca
          <select
            name="idMarca"
            defaultValue={searchParams.get('idMarca') ?? ''}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            disabled={marcas.isLoading}
          >
            <option value="">Todas las marcas</option>
            {marcas.data?.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Precio mínimo
          <input
            name="precioMin"
            type="number"
            min="0"
            step="0.01"
            defaultValue={searchParams.get('precioMin') ?? ''}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Precio máximo
          <input
            name="precioMax"
            type="number"
            min="0"
            step="0.01"
            defaultValue={searchParams.get('precioMax') ?? ''}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Ordenar por
          <select
            name="orden"
            defaultValue={searchParams.get('orden') ?? ''}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          >
            <option value="">Recomendados</option>
            <option value="nombre">Nombre</option>
            <option value="precio">Precio</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Dirección
          <select
            name="dir"
            defaultValue={searchParams.get('dir') ?? ''}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          >
            <option value="">Predeterminada</option>
            <option value="asc">Menor a mayor</option>
            <option value="desc">Mayor a menor</option>
          </select>
        </label>

        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-6">
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white transition hover:bg-lime-700"
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700 transition hover:border-slate-900"
          >
            Limpiar
          </button>
        </div>
      </form>

      {marcas.isError && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {describeError(marcas.error, 'No se pudieron cargar las marcas.')}
        </p>
      )}
      {tipos.isError && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {describeError(tipos.error, 'No se pudieron cargar los tipos de producto.')}
        </p>
      )}

      {productos.isLoading ? (
        <p role="status" className="py-16 text-center text-slate-600">
          Cargando productos...
        </p>
      ) : productos.isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-bold">No pudimos cargar el catálogo.</p>
          <p className="mt-1 text-sm">{describeError(productos.error, 'Error inesperado.')}</p>
          <button
            type="button"
            onClick={() => void productos.refetch()}
            className="mt-4 rounded-full border border-red-300 px-4 py-2 text-sm font-bold"
          >
            Reintentar
          </button>
        </div>
      ) : productos.data?.data.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-900">Todavía no hay productos disponibles</h2>
          <p className="mt-2 text-slate-600">
            Probá cambiar los filtros más adelante. Estamos preparando el catálogo.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between text-sm text-slate-600">
            <p>
              {productos.data?.total} {productos.data?.total === 1 ? 'producto' : 'productos'}
            </p>
            <p>
              Página {filters.page} de {totalPages}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.data?.data.map((producto) => (
              <Link
                key={producto.id}
                to={`/productos/${producto.id}?${searchParams.toString()}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-40 items-center justify-center bg-slate-100">
                  <span
                    aria-hidden="true"
                    className="text-5xl font-black tracking-tight text-slate-300 transition group-hover:text-lime-600"
                  >
                    E.
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {producto.marca.nombre}
                  </p>
                  <h2 className="mt-2 line-clamp-2 min-h-12 font-bold text-slate-950">
                    {producto.nombre}
                  </h2>
                  <p className="mt-3 text-lg font-black text-slate-950">
                    {formatPrice(producto.precioUnitario)}
                  </p>
                  <p
                    className={`mt-2 text-sm font-semibold ${
                      producto.disponible ? 'text-green-700' : 'text-slate-500'
                    }`}
                  >
                    {producto.disponible ? 'Disponible' : 'Sin stock'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <nav aria-label="Paginación del catálogo" className="mt-10 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => changePage(filters.page - 1)}
              disabled={filters.page <= 1}
              className="rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-700 enabled:hover:border-slate-950 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => changePage(filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-700 enabled:hover:border-slate-950 disabled:opacity-40"
            >
              Siguiente
            </button>
          </nav>
        </>
      )}
    </main>
  );
}
