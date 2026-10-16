import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { useTiposProductoCatalogo } from '../../products/api/queries';
import { cn } from '../../../shared/utils/cn';

const ACCENTOS = ['bg-lime-300', 'bg-orange-300', 'bg-sky-300'];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const tiposQuery = useTiposProductoCatalogo();
  const tipos = (tiposQuery.data ?? []).filter((tipo) => tipo.activo);

  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, [location]);

  return (
    <main className="flex-1">
      <section id="inicio" className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-lime-400/20 blur-3xl"
        />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-6 inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
              Todo empieza con un objetivo
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Tu próximo objetivo <span className="text-lime-300">empieza acá.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Suplementos, accesorios y equipamiento para acompañar cada entrenamiento. Elegí tu
              próximo paso y disfrutá el proceso.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/productos"
                className="rounded-full bg-lime-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-lime-200"
              >
                Ver catálogo
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="rounded-full border border-white/30 px-6 py-3 font-bold text-white transition hover:border-white"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-lime-300">
              Entreno 2.0
            </p>
            <p className="mt-12 text-4xl font-black leading-tight sm:text-5xl">
              Entrená
              <br />
              con intención.
            </p>
            <div className="mt-12 flex items-center justify-between border-t border-white/15 pt-5 text-sm text-slate-300">
              <span>Tu ritmo. Tus metas.</span>
              <span aria-hidden="true" className="text-2xl text-lime-300">
                ↗
              </span>
            </div>
          </div>
        </div>
      </section>

      {!(tiposQuery.isSuccess && tipos.length === 0) && (
        <section id="categorias" className="mx-auto w-full max-w-7xl px-5 py-20 sm:py-24">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-700">
                Encontrá lo que te mueve
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Un espacio para cada meta.
              </h2>
            </div>
            <p className="max-w-md text-slate-600">
              Encontrá productos para acompañar tu entrenamiento y descubrí todo lo que necesitás
              para seguir avanzando.
            </p>
          </div>

          {tiposQuery.isLoading ? (
            <p role="status" className="py-10 text-center text-slate-600">
              Cargando categorías...
            </p>
          ) : tiposQuery.isError ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              No se pudieron cargar las categorías: {getApiErrorMessage(tiposQuery.error)}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {tipos.map((tipo, index) => (
                <Link
                  key={tipo.id}
                  to={`/productos?idTipoProducto=${tipo.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={cn(
                      'mb-10 flex h-12 w-12 items-center justify-center rounded-xl font-black text-slate-950',
                      ACCENTOS[index % ACCENTOS.length],
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-950">{tipo.nombre}</h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    {tipo.descripcion ??
                      `Productos de ${tipo.nombre.toLowerCase()} para acompañar tu objetivo.`}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
