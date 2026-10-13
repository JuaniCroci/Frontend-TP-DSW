import { useState } from 'react';
import type {
  ActualizarDescuentoAdmin,
  AdminDescuento,
  CrearDescuentoAdmin,
} from '../../../models/AdminDescuento';
import { getApiErrorMessage } from '../../../core/api/friendlyError';
import { AdminBanner } from '../../../shared/components/AdminBanner';
import { EstadoBadge } from '../../../shared/components/EstadoBadge';
import {
  useActualizarDescuentoAdmin,
  useCrearAplicacionDescuentoAdmin,
  useCrearDescuentoAdmin,
  useDesactivarDescuentoAdmin,
  useEliminarAplicacionDescuentoAdmin,
} from '../api/descuentosMutations';
import {
  useAdminDescuentoDetalle,
  useAdminDescuentos,
  useProductosActivosDescuento,
} from '../api/descuentosQueries';
import { AplicacionesDescuentoModal } from '../components/AplicacionesDescuentoModal';

interface FormDescuento {
  descripcion: string;
  cantidadMinima: string;
  porcentaje: string;
  activo: boolean;
}

const formularioVacio: FormDescuento = {
  descripcion: '',
  cantidadMinima: '',
  porcentaje: '',
  activo: true,
};

export default function AdminDescuentosPage() {
  const descuentos = useAdminDescuentos();
  const crear = useCrearDescuentoAdmin();
  const actualizar = useActualizarDescuentoAdmin();
  const desactivar = useDesactivarDescuentoAdmin();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminDescuento | null>(null);
  const [form, setForm] = useState<FormDescuento>(formularioVacio);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [applicationError, setApplicationError] = useState('');
  const detalle = useAdminDescuentoDetalle(selectedId);
  const productos = useProductosActivosDescuento(Boolean(detalle.data?.activo));
  const crearAplicacion = useCrearAplicacionDescuentoAdmin();
  const eliminarAplicacion = useEliminarAplicacionDescuentoAdmin();

  function handleStartCreate() {
    setEditing(null);
    setCreating(true);
    setForm(formularioVacio);
    setNotice('');
    setFormError('');
  }

  function handleStartEdit(descuento: AdminDescuento) {
    setEditing(descuento);
    setCreating(false);
    setForm({
      descripcion: descuento.descripcion,
      cantidadMinima: String(descuento.cantidadMinima),
      porcentaje: String(descuento.porcentaje),
      activo: descuento.activo,
    });
    setNotice('');
    setFormError('');
  }

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setNotice('');
    const payload: CrearDescuentoAdmin = {
      descripcion: form.descripcion.trim(),
      cantidadMinima: Number(form.cantidadMinima),
      porcentaje: Number(form.porcentaje),
      activo: form.activo,
    };

    try {
      if (editing) {
        const data: ActualizarDescuentoAdmin = payload;
        await actualizar.mutateAsync({ id: editing.id, data });
      } else {
        await crear.mutateAsync(payload);
      }
      setNotice(
        editing ? 'Descuento actualizado correctamente.' : 'Descuento creado correctamente.',
      );
      setEditing(null);
      setCreating(false);
      setForm(formularioVacio);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  async function handleDeactivate(descuento: AdminDescuento) {
    if (!window.confirm(`¿Desactivar el descuento "${descuento.descripcion}"?`)) return;
    setFormError('');
    setNotice('');
    try {
      await desactivar.mutateAsync(descuento.id);
      setNotice('Descuento desactivado correctamente.');
      if (selectedId === descuento.id) setSelectedId(null);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  async function handleToggleActive(descuento: AdminDescuento) {
    setFormError('');
    setNotice('');
    try {
      await actualizar.mutateAsync({
        id: descuento.id,
        data: {
          descripcion: descuento.descripcion,
          cantidadMinima: descuento.cantidadMinima,
          porcentaje: descuento.porcentaje,
          activo: !descuento.activo,
        },
      });
      setNotice(
        descuento.activo
          ? 'Descuento desactivado correctamente.'
          : 'Descuento activado correctamente.',
      );
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  async function handleAddApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedId === null) return;
    const formElement = event.currentTarget;
    setApplicationError('');
    const formData = new FormData(formElement);
    const fechaDesde = String(formData.get('fechaDesde') ?? '');
    const fechaHasta = String(formData.get('fechaHasta') ?? '');
    if (fechaDesde > fechaHasta) {
      setApplicationError('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }

    try {
      await crearAplicacion.mutateAsync({
        id: selectedId,
        data: {
          idProducto: Number(formData.get('idProducto')),
          fechaDesde,
          fechaHasta,
        },
      });
      formElement.reset();
      setNotice('Aplicación agregada correctamente.');
    } catch (error) {
      setApplicationError(getApiErrorMessage(error));
    }
  }

  async function handleRemoveApplication(aplicacionId: number, nombreProducto: string) {
    if (selectedId === null) return;
    if (!window.confirm(`¿Quitar este descuento de "${nombreProducto}"?`)) return;
    setApplicationError('');
    try {
      await eliminarAplicacion.mutateAsync({ id: selectedId, aplicacionId });
      setNotice('Aplicación eliminada correctamente.');
    } catch (error) {
      setApplicationError(getApiErrorMessage(error));
    }
  }

  const saving = crear.isPending || actualizar.isPending;

  return (
    <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Descuentos</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Definí descuentos por cantidad y los productos y fechas en que estarán vigentes. Al
            confirmar un pedido, el backend aplica el mejor descuento elegible por producto; los
            descuentos no se acumulan.
          </p>
        </div>
        {!editing && !creating && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
          >
            Crear descuento
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

      {(creating || editing) && (
        <form
          onSubmit={(event) => void handleFormSubmit(event)}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            {editing ? `Editar ${editing.descripcion}` : 'Nuevo descuento'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Descripción
              <input
                required
                maxLength={255}
                value={form.descripcion}
                onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Cantidad mínima por producto
              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.cantidadMinima}
                onChange={(event) => setForm({ ...form, cantidadMinima: event.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Porcentaje de descuento
              <input
                required
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                value={form.porcentaje}
                onChange={(event) => setForm({ ...form, porcentaje: event.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) => setForm({ ...form, activo: event.target.checked })}
                className="h-4 w-4 accent-lime-600"
              />
              Descuento activo
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-lime-300 px-5 py-2.5 font-bold text-slate-950 enabled:hover:bg-lime-400 disabled:opacity-60"
            >
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(false);
                setFormError('');
              }}
              className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {descuentos.isLoading ? (
        <p role="status" className="py-12 text-center text-slate-600">
          Cargando descuentos...
        </p>
      ) : descuentos.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          No se pudo cargar el listado: {getApiErrorMessage(descuentos.error)}
          <button
            type="button"
            onClick={() => void descuentos.refetch()}
            className="ml-3 rounded-lg border border-red-300 px-3 py-1 font-semibold"
          >
            Reintentar
          </button>
        </div>
      ) : descuentos.data?.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-semibold text-slate-800">Todavía no hay descuentos.</p>
          <p className="mt-1 text-sm text-slate-600">Podés crear el primero desde esta pantalla.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-bold">Descripción</th>
                <th className="px-5 py-4 font-bold">Cantidad mínima</th>
                <th className="px-5 py-4 font-bold">Porcentaje</th>
                <th className="px-5 py-4 font-bold">Estado</th>
                <th className="px-5 py-4 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {descuentos.data?.data.map((descuento) => (
                <tr key={descuento.id}>
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {descuento.descripcion}
                  </td>
                  <td className="px-5 py-4 text-slate-700">{descuento.cantidadMinima}</td>
                  <td className="px-5 py-4 text-slate-700">{descuento.porcentaje}%</td>
                  <td className="px-5 py-4">
                    <EstadoBadge activo={descuento.activo} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(descuento.id);
                          setApplicationError('');
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Aplicaciones
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(descuento)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Editar
                      </button>
                      {descuento.activo ? (
                        <button
                          type="button"
                          onClick={() => void handleDeactivate(descuento)}
                          disabled={desactivar.isPending}
                          className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleToggleActive(descuento)}
                          disabled={actualizar.isPending}
                          className="rounded-lg border border-green-200 px-3 py-1.5 font-semibold text-green-700 hover:bg-green-50 disabled:opacity-60"
                        >
                          Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            {descuentos.data?.total ?? 0}{' '}
            {(descuentos.data?.total ?? 0) === 1 ? 'descuento' : 'descuentos'}
          </p>
        </div>
      )}

      {selectedId !== null && (
        <AplicacionesDescuentoModal
          detalle={detalle}
          productos={productos}
          applicationError={applicationError}
          isCreatingApplication={crearAplicacion.isPending}
          isRemovingApplication={eliminarAplicacion.isPending}
          onAddApplication={(event) => void handleAddApplication(event)}
          onRemoveApplication={(aplicacionId, nombre) =>
            void handleRemoveApplication(aplicacionId, nombre)
          }
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}
