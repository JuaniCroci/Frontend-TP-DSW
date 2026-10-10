import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError } from '../../../core/api/apiError';
import type { AdminCliente, DatosCliente } from '../../../models/AdminCliente';
import { useCambiarEstadoCliente, useGuardarCliente } from '../api/clientesMutations';
import {
  useAdminClienteDetalle,
  useAdminClientes,
  type EstadoClienteFiltro,
} from '../api/clientesQueries';

interface FormularioCliente extends DatosCliente {
  cambiarPassword: boolean;
}

type ModoFormulario = 'crear' | 'editar' | null;

function getApiMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

function optionalValue(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}

export default function AdminClientesPage() {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<EstadoClienteFiltro>('todos');
  const [modo, setModo] = useState<ModoFormulario>(null);
  const [editing, setEditing] = useState<AdminCliente | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const clientes = useAdminClientes(q, estado);
  const detalle = useAdminClienteDetalle(detailId);
  const guardar = useGuardarCliente();
  const cambiarEstado = useCambiarEstadoCliente();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormularioCliente>();

  const changePassword = watch('cambiarPassword', false);

  function openCreate() {
    setModo('crear');
    setEditing(null);
    setNotice('');
    setFormError('');
    setFieldErrors({});
    reset({
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      direccion: '',
      cambiarPassword: false,
    });
  }

  function openEdit(cliente: AdminCliente) {
    setModo('editar');
    setEditing(cliente);
    setNotice('');
    setFormError('');
    setFieldErrors({});
    reset({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono ?? '',
      direccion: cliente.direccion ?? '',
      password: '',
      cambiarPassword: false,
    });
  }

  function closeForm() {
    setModo(null);
    setEditing(null);
    setFormError('');
    setFieldErrors({});
    reset();
  }

  async function submit(form: FormularioCliente) {
    const data: DatosCliente = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
    };

    if (modo === 'crear') {
      data.password = form.password;
      data.telefono = optionalValue(form.telefono ?? '');
      data.direccion = optionalValue(form.direccion ?? '');
    } else {
      data.telefono = form.telefono ?? '';
      data.direccion = form.direccion ?? '';
      if (form.cambiarPassword) data.password = form.password;
    }

    setFormError('');
    setFieldErrors({});
    setNotice('');

    try {
      await guardar.mutateAsync({ id: editing?.id, data });
      setNotice(
        modo === 'editar' ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.',
      );
      closeForm();
    } catch (error) {
      setFormError(getApiMessage(error));
      if (error instanceof ApiError && error.details) {
        setFieldErrors(
          Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])),
        );
      }
    }
  }

  async function toggleActive(cliente: AdminCliente) {
    const action = cliente.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Querés ${action} a "${cliente.nombre}"?`)) return;

    setNotice('');
    setFormError('');
    try {
      await cambiarEstado.mutateAsync({ id: cliente.id, activo: !cliente.activo });
      setNotice(`Cliente ${cliente.activo ? 'desactivado' : 'activado'} correctamente.`);
    } catch (error) {
      setFormError(getApiMessage(error));
    }
  }

  function inputError(field: keyof FormularioCliente): string | undefined {
    return String(errors[field]?.message ?? fieldErrors[field] ?? '') || undefined;
  }

  const passwordRequired = modo === 'crear' || changePassword;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Clientes</h1>
          <p className="mt-2 text-slate-600">Consultá y administrá las cuentas de clientes.</p>
        </div>
        {modo === null && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
          >
            Crear cliente
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

      {modo !== null && (
        <form
          onSubmit={handleSubmit(submit)}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            {modo === 'crear' ? 'Nuevo cliente' : `Editar ${editing?.nombre ?? 'cliente'}`}
          </h2>
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
            {modo === 'editar' && (
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                <input type="checkbox" {...register('cambiarPassword')} />
                Cambiar contraseña
              </label>
            )}
            {(modo === 'crear' || changePassword) && (
              <label className="text-sm font-semibold text-slate-700">
                Contraseña {modo === 'crear' ? '' : 'nueva'}
                <input
                  type="password"
                  autoComplete="new-password"
                  {...register('password', {
                    required: passwordRequired ? 'La contraseña es obligatoria.' : false,
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
              disabled={guardar.isPending}
              className="rounded-full bg-lime-300 px-5 py-2.5 font-bold text-slate-950 enabled:hover:bg-lime-400 disabled:opacity-60"
            >
              {guardar.isPending ? 'Guardando...' : modo === 'editar' ? 'Guardar cambios' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_220px]">
        <label className="text-sm font-semibold text-slate-700">
          Buscar por nombre o email
          <input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Estado
          <select
            value={estado}
            onChange={(event) => setEstado(event.target.value as EstadoClienteFiltro)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </label>
      </div>

      {clientes.isLoading ? (
        <p role="status" className="py-12 text-center text-slate-600">
          Cargando clientes...
        </p>
      ) : clientes.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p>No se pudo cargar el listado: {getApiMessage(clientes.error)}</p>
          <button
            type="button"
            onClick={() => void clientes.refetch()}
            className="mt-3 rounded-full border border-red-300 px-4 py-2 font-semibold"
          >
            Reintentar
          </button>
        </div>
      ) : clientes.data?.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-semibold text-slate-800">No hay clientes para estos filtros.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-bold">Nombre</th>
                <th className="px-5 py-4 font-bold">Email</th>
                <th className="px-5 py-4 font-bold">Teléfono</th>
                <th className="px-5 py-4 font-bold">Estado</th>
                <th className="px-5 py-4 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.data?.data.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="px-5 py-4 text-slate-700">{cliente.nombre}</td>
                  <td className="px-5 py-4 text-slate-700">{cliente.email}</td>
                  <td className="px-5 py-4 text-slate-700">{cliente.telefono || '—'}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${cliente.activo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailId(cliente.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(cliente)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleActive(cliente)}
                        disabled={cambiarEstado.isPending}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        {cliente.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            {clientes.data?.total ?? 0} {(clientes.data?.total ?? 0) === 1 ? 'cliente' : 'clientes'}
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
            aria-labelledby="cliente-detail-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="cliente-detail-title" className="text-xl font-bold text-slate-950">
                Detalle del cliente
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
            {detalle.isLoading ? (
              <p role="status" className="py-8 text-slate-600">
                Cargando detalle...
              </p>
            ) : detalle.isError ? (
              <p role="alert" className="py-8 text-red-700">
                {getApiMessage(detalle.error)}
              </p>
            ) : detalle.data ? (
              <dl className="mt-5 space-y-3">
                {[
                  ['Nombre', detalle.data.nombre],
                  ['Email', detalle.data.email],
                  ['Teléfono', detalle.data.telefono],
                  ['Dirección', detalle.data.direccion],
                  ['Estado', detalle.data.activo ? 'Activo' : 'Inactivo'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-1 text-slate-900">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>
        </div>
      )}
    </section>
  );
}
