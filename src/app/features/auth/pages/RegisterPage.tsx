import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { friendlyErrorMessage } from '../../../core/api/friendlyError';
import { toApiError } from '../../../core/api/apiError';
import type { RegisterInput } from '../../../models/Auth';
import { detailsToFieldErrors } from '../../../shared/utils/fieldErrors';
import { useRegister } from '../api/mutations';

interface FormularioRegistro {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
}

function optionalValue(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const registrar = useRegister();
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioRegistro>();

  async function handleFormSubmit(form: FormularioRegistro) {
    setApiError('');
    setFieldErrors({});
    const data: RegisterInput = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      password: form.password,
    };
    data.telefono = optionalValue(form.telefono);
    data.direccion = optionalValue(form.direccion);

    try {
      await registrar.mutateAsync(data);
      navigate('/login', { replace: true, state: { registrationSuccess: true } });
    } catch (error) {
      const apiError = toApiError(error);
      setApiError(friendlyErrorMessage(apiError));
      if (apiError.details) setFieldErrors(detailsToFieldErrors(apiError.details));
    }
  }

  function fieldError(field: keyof FormularioRegistro): string | undefined {
    return String(errors[field]?.message ?? fieldErrors[field] ?? '') || undefined;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100 px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Entreno 2.0</h1>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-md"
      >
        <h2 className="mb-2 text-2xl font-bold text-slate-800">Crear cuenta</h2>
        <p className="mb-6 text-sm text-slate-600">Registrate para empezar a comprar.</p>

        {apiError && (
          <div
            role="alert"
            className="mb-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700"
          >
            {apiError}
          </div>
        )}

        <label className="mb-4 block text-sm font-medium text-slate-700">
          Nombre
          <input
            autoComplete="name"
            {...register('nombre', { required: 'El nombre es obligatorio.' })}
            aria-invalid={Boolean(fieldError('nombre'))}
            className="mt-1 w-full rounded border border-slate-300 p-2"
          />
          {fieldError('nombre') && (
            <span className="mt-1 block text-sm text-red-700">{fieldError('nombre')}</span>
          )}
        </label>

        <label className="mb-4 block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            autoComplete="email"
            {...register('email', { required: 'El email es obligatorio.' })}
            aria-invalid={Boolean(fieldError('email'))}
            className="mt-1 w-full rounded border border-slate-300 p-2"
          />
          {fieldError('email') && (
            <span className="mt-1 block text-sm text-red-700">{fieldError('email')}</span>
          )}
        </label>

        <label className="mb-4 block text-sm font-medium text-slate-700">
          Contraseña
          <input
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'La contraseña es obligatoria.',
              minLength: { value: 8, message: 'La contraseña debe tener al menos 8 caracteres.' },
            })}
            aria-invalid={Boolean(fieldError('password'))}
            className="mt-1 w-full rounded border border-slate-300 p-2"
          />
          {fieldError('password') && (
            <span className="mt-1 block text-sm text-red-700">{fieldError('password')}</span>
          )}
        </label>

        <label className="mb-4 block text-sm font-medium text-slate-700">
          Teléfono (opcional)
          <input
            type="tel"
            autoComplete="tel"
            {...register('telefono')}
            aria-invalid={Boolean(fieldError('telefono'))}
            className="mt-1 w-full rounded border border-slate-300 p-2"
          />
          {fieldError('telefono') && (
            <span className="mt-1 block text-sm text-red-700">{fieldError('telefono')}</span>
          )}
        </label>

        <label className="mb-6 block text-sm font-medium text-slate-700">
          Dirección (opcional)
          <input
            autoComplete="street-address"
            {...register('direccion')}
            aria-invalid={Boolean(fieldError('direccion'))}
            className="mt-1 w-full rounded border border-slate-300 p-2"
          />
          {fieldError('direccion') && (
            <span className="mt-1 block text-sm text-red-700">{fieldError('direccion')}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>
      <Link to="/login" className="text-sm font-medium text-slate-700 underline underline-offset-4">
        Ya tengo una cuenta
      </Link>
      <Link to="/" className="text-sm font-medium text-slate-700 underline underline-offset-4">
        Volver al inicio
      </Link>
    </main>
  );
}
