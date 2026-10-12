import { useState } from 'react';
import type {
  ActualizarDescuentoAdmin,
  AdminDescuento,
  CrearDescuentoAdmin,
} from '../../../models/AdminDescuento';
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

function apiMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

function fechaCorta(value: string): string {
  return value.slice(0, 10);
}

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

  function startCreate() {
    setEditing(null);
    setCreating(true);
    setForm(formularioVacio);
    setNotice('');
    setFormError('');
  }

  function startEdit(descuento: AdminDescuento) {
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

  async function saveDescuento(event: React.FormEvent<HTMLFormElement>) {
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
      setFormError(apiMessage(error));
    }
  }

  async function deactivate(descuento: AdminDescuento) {
    if (!window.confirm(`¿Desactivar el descuento "${descuento.descripcion}"?`)) return;
    setFormError('');
    setNotice('');
    try {
      await desactivar.mutateAsync(descuento.id);
      setNotice('Descuento desactivado correctamente.');
      if (selectedId === descuento.id) setSelectedId(null);
    } catch (error) {
      setFormError(apiMessage(error));
    }
  }

  async function toggleActive(descuento: AdminDescuento) {
    setFormError('');
    setNotice('');
    try {
      await actualizar.mutateAsync({ id: descuento.id, data: { activo: !descuento.activo } });
      setNotice(
        descuento.activo
          ? 'Descuento desactivado correctamente.'
          : 'Descuento activado correctamente.',
      );
    } catch (error) {
      setFormError(apiMessage(error));
    }
  }

  async function addApplication(event: React.FormEvent<HTMLFormElement>) {
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
      setApplicationError(apiMessage(error));
    }
  }

  async function removeApplication(aplicacionId: number, nombreProducto: string) {
    if (selectedId === null) return;
    if (!window.confirm(`¿Quitar este descuento de "${nombreProducto}"?`)) return;
    setApplicationError('');
    try {
      await eliminarAplicacion.mutateAsync({ id: selectedId, aplicacionId });
      setNotice('Aplicación eliminada correctamente.');
    } catch (error) {
      setApplicationError(apiMessage(error));
    }
  }

  const saving = crear.isPending || actualizar.isPending;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
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
            onClick={startCreate}
            className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
          >
            Crear descuento
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

      {(creating || editing) && (
        <form
          onSubmit={(event) => void saveDescuento(event)}
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
          No se pudo cargar el listado: {apiMessage(descuentos.error)}
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
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        descuento.activo
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {descuento.activo ? 'Activo' : 'Inactivo'}
                    </span>
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
                        onClick={() => startEdit(descuento)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Editar
                      </button>
                      {descuento.activo ? (
                        <button
                          type="button"
                          onClick={() => void deactivate(descuento)}
                          disabled={desactivar.isPending}
                          className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void toggleActive(descuento)}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedId(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="descuento-aplicaciones-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-lime-700">
                  Aplicaciones por producto
                </p>
                <h2
                  id="descuento-aplicaciones-title"
                  className="mt-1 text-xl font-bold text-slate-950"
                >
                  {detalle.data?.descripcion ?? 'Descuento'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Cerrar aplicaciones"
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {detalle.isLoading ? (
              <p role="status" className="py-8 text-slate-600">
                Cargando aplicaciones...
              </p>
            ) : detalle.isError ? (
              <p role="alert" className="py-8 text-red-700">
                {apiMessage(detalle.error)}
              </p>
            ) : detalle.data ? (
              <>
                {detalle.data.aplicaciones.length === 0 ? (
                  <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Este descuento todavía no está asociado a ningún producto.
                  </p>
                ) : (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-bold">Producto</th>
                          <th className="px-4 py-3 font-bold">Desde</th>
                          <th className="px-4 py-3 font-bold">Hasta</th>
                          <th className="px-4 py-3 text-right font-bold">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detalle.data.aplicaciones.map((aplicacion) => (
                          <tr key={aplicacion.id}>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {aplicacion.producto.nombre}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {fechaCorta(aplicacion.fechaDesde)}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {fechaCorta(aplicacion.fechaHasta)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  void removeApplication(aplicacion.id, aplicacion.producto.nombre)
                                }
                                disabled={eliminarAplicacion.isPending}
                                className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                              >
                                Quitar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {detalle.data.activo && (
                  <form
                    onSubmit={(event) => void addApplication(event)}
                    className="mt-6 rounded-xl bg-slate-50 p-5"
                  >
                    <h3 className="font-bold text-slate-900">Aplicar a un producto</h3>
                    {applicationError && (
                      <p
                        role="alert"
                        className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800"
                      >
                        {applicationError}
                      </p>
                    )}
                    {productos.isError ? (
                      <p role="alert" className="mt-3 text-sm text-red-700">
                        No se pudieron cargar los productos: {apiMessage(productos.error)}
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <label className="text-sm font-semibold text-slate-700 sm:col-span-3">
                          Producto activo
                          <select
                            name="idProducto"
                            required
                            defaultValue=""
                            disabled={productos.isLoading || productos.data?.length === 0}
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
                          >
                            <option value="" disabled>
                              {productos.isLoading
                                ? 'Cargando productos...'
                                : 'Seleccioná un producto'}
                            </option>
                            {productos.data?.map((producto) => (
                              <option key={producto.id} value={producto.id}>
                                {producto.nombre}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm font-semibold text-slate-700">
                          Vigente desde
                          <input
                            name="fechaDesde"
                            type="date"
                            required
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
                          />
                        </label>
                        <label className="text-sm font-semibold text-slate-700">
                          Vigente hasta
                          <input
                            name="fechaHasta"
                            type="date"
                            required
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
                          />
                        </label>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={
                              crearAplicacion.isPending ||
                              productos.isLoading ||
                              productos.data?.length === 0
                            }
                            className="w-full rounded-full bg-slate-950 px-4 py-2.5 font-bold text-white enabled:hover:bg-lime-700 disabled:opacity-50"
                          >
                            {crearAplicacion.isPending ? 'Aplicando...' : 'Aplicar descuento'}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </>
            ) : null}
          </section>
        </div>
      )}
    </main>
  );
}
