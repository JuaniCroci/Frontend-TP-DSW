import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useAgregarAlCarrito } from '../api/mutations';

interface AgregarAlCarritoProps {
  productoId: number;
  stock: number;
  disponible: boolean;
  loginReturn: string;
}

export function AgregarAlCarrito({
  productoId,
  stock,
  disponible,
  loginReturn,
}: AgregarAlCarritoProps) {
  const { isAuthenticated, user } = useAuth();
  const agregar = useAgregarAlCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [cartNotice, setCartNotice] = useState('');
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    setCantidad(1);
    setCartNotice('');
    setCartError('');
  }, [productoId]);

  async function handleAddToCart() {
    setCartError('');
    setCartNotice('');
    try {
      await agregar.mutateAsync({ idProducto: productoId, cantidad });
      setCartNotice('Producto agregado al carrito.');
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'No se pudo agregar el producto.');
    }
  }

  if (user?.rol === 'CLIENTE') {
    return (
      <div className="mt-6">
        <label className="block max-w-xs text-sm font-semibold text-slate-700">
          Cantidad
          <input
            type="number"
            min="1"
            max={stock}
            step="1"
            value={cantidad}
            onChange={(event) => setCantidad(Number(event.target.value))}
            disabled={!disponible || agregar.isPending}
            className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
        </label>
        <button
          type="button"
          onClick={() => void handleAddToCart()}
          disabled={
            !disponible ||
            agregar.isPending ||
            !Number.isInteger(cantidad) ||
            cantidad < 1 ||
            cantidad > stock
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
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        state={{ from: loginReturn }}
        className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
      >
        Iniciá sesión para comprar
      </Link>
    );
  }

  return null;
}
