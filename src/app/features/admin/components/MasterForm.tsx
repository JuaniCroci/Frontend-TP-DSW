import type { FieldErrors, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import type { DatosMaestro } from '../../../models/AdminCatalogo';
import type { CampoMaestro } from '../campoMaestro';

interface MasterFormProps {
  fields: CampoMaestro[];
  title: string;
  isEditing: boolean;
  isPending: boolean;
  register: UseFormRegister<DatosMaestro>;
  handleSubmit: UseFormHandleSubmit<DatosMaestro>;
  errors: FieldErrors<DatosMaestro>;
  serverFieldErrors: Record<string, string>;
  onSubmitValid: (data: DatosMaestro) => void;
  onCancel: () => void;
}

export function MasterForm({
  fields,
  title,
  isEditing,
  isPending,
  register,
  handleSubmit,
  errors,
  serverFieldErrors,
  onSubmitValid,
  onCancel,
}: MasterFormProps) {
  return (
    <form
      onSubmit={handleSubmit(onSubmitValid)}
      className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-5 text-xl font-bold text-slate-900">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="text-sm font-semibold text-slate-700">
            {field.label}
            <input
              type={field.type ?? 'text'}
              maxLength={field.maxLength}
              {...register(field.name, {
                required: field.required ? `${field.label} es obligatorio.` : false,
                minLength: field.minLength
                  ? {
                      value: field.minLength,
                      message: `Mínimo ${field.minLength} caracteres.`,
                    }
                  : undefined,
                maxLength: field.maxLength
                  ? {
                      value: field.maxLength,
                      message: `Máximo ${field.maxLength} caracteres.`,
                    }
                  : undefined,
                pattern: field.pattern
                  ? {
                      value: field.pattern,
                      message: field.patternMessage ?? 'Formato inválido.',
                    }
                  : undefined,
              })}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              aria-invalid={Boolean(errors[field.name] || serverFieldErrors[field.name])}
            />
            {(errors[field.name]?.message || serverFieldErrors[field.name]) && (
              <span className="mt-1 block text-sm font-normal text-red-700">
                {String(errors[field.name]?.message ?? serverFieldErrors[field.name])}
              </span>
            )}
          </label>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-lime-300 px-5 py-2.5 font-bold text-slate-950 enabled:hover:bg-lime-400 disabled:opacity-60"
        >
          {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear'}
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
