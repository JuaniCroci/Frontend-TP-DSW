import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError } from '../../../core/api/apiError';
import type {
  DatosMaestro,
  RegistroCatalogo,
  RecursoCatalogo,
} from '../../../models/AdminCatalogo';
import { useDarDeBajaMaestro, useGuardarMaestro } from '../api/mutations';
import { useAdminCatalogo, useAdminCatalogoDetalle } from '../api/queries';

export interface CampoMaestro {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
}

export interface AdminMasterPageProps {
  resource: RecursoCatalogo;
  title: string;
  description: string;
  fields: CampoMaestro[];
  nameField: string;
}

function valueFor(record: RegistroCatalogo, field: string): string {
  const value = record[field as keyof RegistroCatalogo];
  return typeof value === 'string' ? value : '';
}

function getApiMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

export function AdminMasterPage({
  resource,
  title,
  description,
  fields,
  nameField,
}: AdminMasterPageProps) {
  const catalogo = useAdminCatalogo(resource);
  const guardar = useGuardarMaestro();
  const darDeBaja = useDarDeBajaMaestro();
  const [editing, setEditing] = useState<RegistroCatalogo | null>(null);
  const [creating, setCreating] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const detail = useAdminCatalogoDetalle(resource, detailId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DatosMaestro>();

  function startCreate() {
    setEditing(null);
    setCreating(true);
    setFieldErrors({});
    setFormError('');
    setNotice('');
    reset(Object.fromEntries(fields.map((field) => [field.name, ''])));
  }

  function startEdit(record: RegistroCatalogo) {
    setEditing(record);
    setCreating(false);
    setFieldErrors({});
    setFormError('');
    setNotice('');
    reset(Object.fromEntries(fields.map((field) => [field.name, valueFor(record, field.name)])));
  }

  async function submit(data: DatosMaestro) {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value.trim() !== ''),
    );
    setFormError('');
    setFieldErrors({});
    setNotice('');

    try {
      await guardar.mutateAsync({
        resource,
        data: cleanedData,
        id: editing?.id,
      });
      setNotice(editing ? 'Cambios guardados correctamente.' : 'Registro creado correctamente.');
      setEditing(null);
      setCreating(false);
      reset(Object.fromEntries(fields.map((field) => [field.name, ''])));
    } catch (error) {
      setFormError(getApiMessage(error));
      if (error instanceof ApiError && error.details) {
        setFieldErrors(
          Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])),
        );
      }
    }
  }

  async function deactivate(record: RegistroCatalogo) {
    const name = valueFor(record, nameField);
    if (!window.confirm(`¿Desactivar "${name}"? Esta acción no se puede deshacer desde aquí.`)) {
      return;
    }

    setFormError('');
    setNotice('');
    try {
      await darDeBaja.mutateAsync({ resource, id: record.id });
      setNotice('Registro desactivado correctamente.');
    } catch (error) {
      setFormError(getApiMessage(error));
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
          <p className="mt-2 text-slate-600">{description}</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startCreate}
            className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
          >
            Crear {title.toLocaleLowerCase('es')}
          </button>
        )}
      </div>

      {notice && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
        >
          {notice}
        </p>
      )}
      {formError && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {formError}
        </p>
      )}

      {(editing || creating) && (
        <form
          onSubmit={handleSubmit(submit)}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            {editing ? `Editar ${valueFor(editing, nameField)}` : `Nuevo registro`}
          </h2>
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
                  aria-invalid={Boolean(errors[field.name] || fieldErrors[field.name])}
                />
                {(errors[field.name]?.message || fieldErrors[field.name]) && (
                  <span className="mt-1 block text-sm font-normal text-red-700">
                    {String(errors[field.name]?.message ?? fieldErrors[field.name])}
                  </span>
                )}
              </label>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={guardar.isPending}
              className="rounded-full bg-lime-300 px-5 py-2.5 font-bold text-slate-950 enabled:hover:bg-lime-400 disabled:opacity-60"
            >
              {guardar.isPending ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(false);
                setFormError('');
                setFieldErrors({});
              }}
              className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {catalogo.isLoading ? (
        <p role="status" className="py-12 text-center text-slate-600">
          Cargando {title.toLocaleLowerCase('es')}...
        </p>
      ) : catalogo.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p>No se pudo cargar el listado: {getApiMessage(catalogo.error)}</p>
          <button
            type="button"
            onClick={() => void catalogo.refetch()}
            className="mt-3 rounded-full border border-red-300 px-4 py-2 font-semibold"
          >
            Reintentar
          </button>
        </div>
      ) : catalogo.data?.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-semibold text-slate-800">Todavía no hay registros.</p>
          <p className="mt-1 text-sm text-slate-600">Podés crear el primero desde esta pantalla.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {fields.slice(0, 3).map((field) => (
                  <th key={field.name} className="px-5 py-4 font-bold">
                    {field.label}
                  </th>
                ))}
                <th className="px-5 py-4 font-bold">Estado</th>
                <th className="px-5 py-4 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {catalogo.data?.data.map((record) => (
                <tr key={record.id}>
                  {fields.slice(0, 3).map((field) => (
                    <td key={field.name} className="px-5 py-4 text-slate-700">
                      {valueFor(record, field.name) || '—'}
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        record.activo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {record.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailId(record.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(record)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Editar
                      </button>
                      {record.activo && (
                        <button
                          type="button"
                          onClick={() => void deactivate(record)}
                          disabled={darDeBaja.isPending}
                          className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            {catalogo.data?.total ?? 0}{' '}
            {(catalogo.data?.total ?? 0) === 1 ? 'registro' : 'registros'}
          </p>
        </div>
      )}

      {detailId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailId(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-detail-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="admin-detail-title" className="text-xl font-bold text-slate-950">
                Detalle
              </h2>
              <button
                type="button"
                onClick={() => setDetailId(null)}
                aria-label="Cerrar detalle"
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            {detail.isLoading ? (
              <p role="status" className="py-8 text-slate-600">
                Cargando detalle...
              </p>
            ) : detail.isError ? (
              <p role="alert" className="py-8 text-red-700">
                {getApiMessage(detail.error)}
              </p>
            ) : detail.data ? (
              <dl className="mt-5 space-y-3">
                {fields.map((field) => (
                  <div key={field.name}>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {field.label}
                    </dt>
                    <dd className="mt-1 text-slate-900">
                      {valueFor(detail.data, field.name) || '—'}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Estado
                  </dt>
                  <dd className="mt-1 text-slate-900">
                    {detail.data.activo ? 'Activo' : 'Inactivo'}
                  </dd>
                </div>
              </dl>
            ) : null}
          </section>
        </div>
      )}
    </section>
  );
}
