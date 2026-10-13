import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError } from '../../../core/api/apiError';
import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { AdminBanner } from '../../../shared/components/AdminBanner';
import { EstadoBadge } from '../../../shared/components/EstadoBadge';
import type { AdminCliente, DatosCliente } from '../../../models/AdminCliente';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { useActualizarCliente, useCambiarEstadoCliente } from '../api/clientesMutations';
import {
  useAdminClienteDetalle,
  useAdminClientes,
  type EstadoClienteFiltro,
} from '../api/clientesQueries';
import { ClienteDetalleModal } from '../components/ClienteDetalleModal';
import { ClienteForm, type FormularioCliente } from '../components/ClienteForm';

export default function AdminClientesPage() {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<EstadoClienteFiltro>('todos');
  const [editing, setEditing] = useState<AdminCliente | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const qDebounced = useDebounce(q, 300);
  const clientes = useAdminClientes(qDebounced, estado);
  const detalle = useAdminClienteDetalle(detailId);
  const actualizar = useActualizarCliente();
  const cambiarEstado = useCambiarEstadoCliente();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormularioCliente>();

  const changePassword = watch('cambiarPassword', false);

  function handleOpenEdit(cliente: AdminCliente) {
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

  function handleCloseForm() {
    setEditing(null);
    setFormError('');
    setFieldErrors({});
    reset();
  }

  async function handleFormSubmit(form: FormularioCliente) {
    const data: DatosCliente = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
    };

    data.telefono = form.telefono ?? '';
    data.direccion = form.direccion ?? '';
    if (form.cambiarPassword) data.password = form.password;

    setFormError('');
    setFieldErrors({});
    setNotice('');

    try {
      if (!editing) throw new Error('No hay un cliente seleccionado para editar.');
      await actualizar.mutateAsync({ id: editing.id, data });
      setNotice('Cliente actualizado correctamente.');
      handleCloseForm();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
      if (error instanceof ApiError && error.details) {
        setFieldErrors(
          Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])),
        );
      }
    }
  }

  async function handleToggleActive(cliente: AdminCliente) {
    const action = cliente.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Querés ${action} a "${cliente.nombre}"?`)) return;

    setNotice('');
    setFormError('');
    try {
      await cambiarEstado.mutateAsync({ id: cliente.id, activo: !cliente.activo });
      setNotice(`Cliente ${cliente.activo ? 'desactivado' : 'activado'} correctamente.`);
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
          <h1 className="mt-2 text-3xl font-black text-slate-950">Clientes</h1>
          <p className="mt-2 text-slate-600">
            Consultá, editá y administrá el estado de las cuentas registradas.
          </p>
        </div>
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

      {editing !== null && (
        <ClienteForm
          title={`Editar ${editing.nombre}`}
          changePassword={changePassword}
          isPending={actualizar.isPending}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          serverFieldErrors={fieldErrors}
          onSubmitValid={(data) => void handleFormSubmit(data)}
          onCancel={handleCloseForm}
        />
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
          <p>No se pudo cargar el listado: {getApiErrorMessage(clientes.error)}</p>
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
                    <EstadoBadge activo={cliente.activo} />
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
                        onClick={() => handleOpenEdit(cliente)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(cliente)}
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
        <ClienteDetalleModal detalle={detalle} onClose={() => setDetailId(null)} />
      )}
    </section>
  );
}
