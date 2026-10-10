import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100 px-4">
      <h1 className="text-3xl font-bold text-slate-900">Entreno 2.0</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-slate-800">Iniciar sesión</h2>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 p-2"
            required
          />
        </label>

        <label className="mb-4 block text-sm font-medium text-slate-700">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 p-2"
            required
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-slate-900 px-4 py-2 font-medium text-white"
        >
          {isSubmitting ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
      <Link to="/" className="text-sm font-medium text-slate-700 underline underline-offset-4">
        Volver al inicio
      </Link>
    </main>
  );
}
