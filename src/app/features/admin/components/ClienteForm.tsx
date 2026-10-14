import type { FieldErrors, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import type { DatosCliente } from '../../../models/AdminCliente';

export interface FormularioCliente extends DatosCliente {
  cambiarPassword: boolean;
}

interface ClienteFormProps {
  title: string;
  changePassword: boolean;
  isPending: boolean;
  register: UseFormRegister<FormularioCliente>;
  handleSubmit: UseFormHandleSubmit<FormularioCliente>;
  errors: FieldErrors<FormularioCliente>;
  serverFieldErrors: Record<string, string>;
  onSubmitValid: (data: FormularioCliente) => void;
  onCancel: () => void;
}

export function ClienteForm({
  title,
  changePassword,
  isPending,
  register,
  handleSubmit,
  errors,
  serverFieldErrors,
  onSubmitValid,
  onCancel,
}: ClienteFormProps) {
  function inputError(field: keyof FormularioCliente): string | undefined {
    return String(errors[field]?.message ?? serverFieldErrors[field] ?? '') || undefined;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmitValid)}
      className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-5 text-xl font-bold text-slate-900">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Nombre
          <input
            {...register('nombre', { required: 'El nombre es obligatorio.' })}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            aria-invalid={Boolean(inputError('nombre'))}
          />
          {inputError('nombre') && (
            <span className="mt-1 block text-sm font-normal text-red-700">
              {inputError('nombre')}
            </span>
          )}
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Email
          <input
            type="email"
            {...register('email', { required: 'El email es obligatorio.' })}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            aria-invalid={Boolean(inputError('email'))}
          />
          {inputError('email') && (
            <span className="mt-1 block text-sm font-normal text-red-700">
              {inputError('email')}
            </span>
          )}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
          <input type="checkbox" {...register('cambiarPassword')} />
          Cambiar contraseña
        </label>
        {changePassword && (
          <label className="text-sm font-semibold text-slate-700">
            Contraseña nueva
            <input
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: changePassword ? 'La contraseña es obligatoria.' : false,
              })}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              aria-invalid={Boolean(inputError('password'))}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              La contraseña debe cumplir los requisitos configurados en el servidor.
            </span>
            {inputError('password') && (
              <span className="mt-1 block text-sm font-normal text-red-700">
                {inputError('password')}
              </span>
            )}
          </label>
        )}
        <label className="text-sm font-semibold text-slate-700">
          Teléfono
          <input
            type="tel"
            {...register('telefono')}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            aria-invalid={Boolean(inputError('telefono'))}
          />
          {inputError('telefono') && (
            <span className="mt-1 block text-sm font-normal text-red-700">
              {inputError('telefono')}
            </span>
          )}
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Dirección
          <input
            {...register('direccion')}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            aria-invalid={Boolean(inputError('direccion'))}
          />
          {inputError('direccion') && (
            <span className="mt-1 block text-sm font-normal text-red-700">
              {inputError('direccion')}
            </span>
          )}
        </label>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-lime-300 px-5 py-2.5 font-bold text-slate-950 enabled:hover:bg-lime-400 disabled:opacity-60"
        >
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
