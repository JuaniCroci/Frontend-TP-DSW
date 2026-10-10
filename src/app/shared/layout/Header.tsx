import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-4 sm:flex-row">
        <Link to="/" className="text-2xl font-black tracking-tight text-slate-950">
          Entreno <span className="text-lime-600">2.0</span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold text-slate-700"
        >
          <Link to="/" className="transition hover:text-lime-700">
            Inicio
          </Link>
          <Link to="/#categorias" className="transition hover:text-lime-700">
            Categorías
          </Link>
          <Link to="/productos" className="transition hover:text-lime-700">
            Tienda
          </Link>
          {isAuthenticated ? (
            <>
              <span className="text-slate-500">Hola, {user?.nombre}</span>
              {user?.rol === 'ADMIN' && (
                <Link to="/admin" className="transition hover:text-lime-700">
                  Administración
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-300 px-4 py-2 transition hover:border-slate-900 hover:text-slate-950"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-lime-700"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
