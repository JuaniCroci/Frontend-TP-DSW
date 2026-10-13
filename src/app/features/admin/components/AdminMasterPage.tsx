import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError } from '../../../core/api/apiError';
import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { AdminBanner } from '../../../shared/components/AdminBanner';
import { EstadoBadge } from '../../../shared/components/EstadoBadge';
import type {
  DatosMaestro,
  PayloadMaestro,
  RegistroCatalogo,
  RecursoCatalogo,
} from '../../../models/AdminCatalogo';
import { useDarDeBajaMaestro, useGuardarMaestro } from '../api/mutations';
import { useAdminCatalogo, useAdminCatalogoDetalle } from '../api/queries';
import type { CampoMaestro } from '../campoMaestro';
import { valueFor } from '../valueFor';
import { MasterDetailModal } from './MasterDetailModal';
import { MasterForm } from './MasterForm';

export interface AdminMasterPageProps {
  resource: RecursoCatalogo;
  title: string;
  description: string;
  fields: CampoMaestro[];
  nameField: string;
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

  function handleStartCreate() {
    setEditing(null);
    setCreating(true);
    setFieldErrors({});
    setFormError('');
    setNotice('');
    reset(Object.fromEntries(fields.map((field) => [field.name, ''])));
  }

  function handleStartEdit(record: RegistroCatalogo) {
    setEditing(record);
    setCreating(false);
    setFieldErrors({});
    setFormError('');
    setNotice('');
    reset(Object.fromEntries(fields.map((field) => [field.name, valueFor(record, field.name)])));
  }

  function handleCancel() {
    setEditing(null);
    setCreating(false);
    setFormError('');
    setFieldErrors({});
  }

  function buildPayload(data: DatosMaestro): PayloadMaestro {
    const payload: PayloadMaestro = {};
    for (const field of fields) {
      const value = String(data[field.name] ?? '').trim();
      if (value === '') {
        if (editing && valueFor(editing, field.name) !== '') payload[field.name] = null;
        continue;
      }
      payload[field.name] = value;
    }
    return payload;
  }

  async function handleFormSubmit(data: DatosMaestro) {
    const cleanedData = buildPayload(data);
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
      setFormError(getApiErrorMessage(error));
      if (error instanceof ApiError && error.details) {
        setFieldErrors(
          Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])),
        );
      }
    }
  }

  async function handleDeactivate(record: RegistroCatalogo) {
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
      setFormError(getApiErrorMessage(error));
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
            onClick={handleStartCreate}
            className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
          >
            Crear {title.toLocaleLowerCase('es')}
          </button>
        )}
      </div>

      {notice && (
        <AdminBanner tone="success" className="mb-5">
          {notice}
        </AdminBanner>
      )}
      {formError && (
        <AdminBanner tone="error" className="mb-5">
          {formError}
        </AdminBanner>
      )}

      {(editing || creating) && (
        <MasterForm
          fields={fields}
          title={editing ? `Editar ${valueFor(editing, nameField)}` : `Nuevo registro`}
          isEditing={Boolean(editing)}
          isPending={guardar.isPending}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          serverFieldErrors={fieldErrors}
          onSubmitValid={(data) => void handleFormSubmit(data)}
          onCancel={handleCancel}
        />
      )}

      {catalogo.isLoading ? (
        <p role="status" className="py-12 text-center text-slate-600">
          Cargando {title.toLocaleLowerCase('es')}...
        </p>
      ) : catalogo.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p>No se pudo cargar el listado: {getApiErrorMessage(catalogo.error)}</p>
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
                    <EstadoBadge activo={record.activo} />
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
                        onClick={() => handleStartEdit(record)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Editar
                      </button>
                      {record.activo && (
                        <button
                          type="button"
                          onClick={() => void handleDeactivate(record)}
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
        <MasterDetailModal detail={detail} fields={fields} onClose={() => setDetailId(null)} />
      )}
    </section>
  );
}
