import { useState } from 'react';
import { useAdminIngresos, useAdminIngresoDetalle } from '../api/ingresosQueries';
import { useCrearIngreso, useAnularIngreso } from '../api/ingresosMutations';
import { useAdminCatalogo } from '../api/queries';
import { useAdminProductos } from '../api/productosQueries';
import type { EstadoIngreso, CrearIngresoInput} from '../../../models/Ingreso.ts';
import type { Proveedor } from '../../../models/AdminCatalogo';
import { Spinner } from '../../../shared/components/Spinner';
import { AdminBanner } from '../../../shared/components/AdminBanner';
import { AdminModal } from '../../../shared/components/AdminModal';
import { formatMoney } from '../../../shared/utils/formatMoney';
import { getApiErrorMessage } from '../../../core/api/friendlyError';

interface LineaForm {
  idProducto: number;
  cantidad: string;
  precioUnitario: string;
}

const INPUT_CLASS = 'mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal';
const SELECT_CLASS = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal';
const LABEL_CLASS = 'text-sm font-semibold text-slate-700';
const DT_CLASS = 'text-xs font-bold uppercase tracking-wide text-slate-500';

function EstadoIngresoBadge({ estado }: { estado: EstadoIngreso }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        estado === 'REGISTRADO' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {estado}
    </span>
  );
}

export default function IngresosAdminPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoIngreso | ''>('');
  const [desdeFiltro, setDesdeFiltro] = useState('');
  const [hastaFiltro, setHastaFiltro] = useState('');
  const [idDetalle, setIdDetalle] = useState<number | null>(null);
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [exitoGlobal, setExitoGlobal] = useState<string | null>(null);

  // Queries
  const {
    data: respuestaIngresos,
    isLoading,
    error,
  } = useAdminIngresos({
    estado: estadoFiltro,
    desde: desdeFiltro,
    hasta: hastaFiltro,
  });
  const { data: proveedoresResp } = useAdminCatalogo('proveedores');
  const proveedores = (proveedoresResp?.data as Proveedor[]) ?? [];
  const { data: productosResp } = useAdminProductos({ page: 1, size: 100 });
  const productos = productosResp?.data ?? [];
  const { data: detalleIngreso, isLoading: loadingDetalle } = useAdminIngresoDetalle(idDetalle);

  // Mutaciones
  const crearMutation = useCrearIngreso();
  const anularMutation = useAnularIngreso();

  // Formulario Nuevo Ingreso
  const [nroIngreso, setNroIngreso] = useState('');
  const [idProveedor, setIdProveedor] = useState<number>(0);
  const [fecha, setFecha] = useState('');
  const [lineas, setLineas] = useState<LineaForm[]>([
    { idProducto: 0, cantidad: '1', precioUnitario: '' },
  ]);

  const handleAddLinea = () => {
  setLineas([...lineas, { idProducto: 0, cantidad: '1', precioUnitario: '' }]);
};

  const handleRemoveLinea = (index: number) => {
    if (lineas.length === 1) return;
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const handleLineaChange = <K extends keyof LineaForm>(
  index: number,
  field: K,
  value: LineaForm[K],
) => {
  const copy = [...lineas];
  copy[index] = { ...copy[index], [field]: value };
  setLineas(copy);
};

  const calcularTotalNuevo = () => {
    return lineas.reduce((acc, line) => {
      const cant = Number(line.cantidad) || 0;
      const pu = Number(line.precioUnitario) || 0;
      return acc + cant * pu;
    }, 0);
  };

  const handleSubmitNuevo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGlobal(null);
    setExitoGlobal(null);

    if (!nroIngreso.trim()) {
      setErrorGlobal('El número de ingreso es obligatorio');
      return;
    }
    if (!idProveedor) {
      setErrorGlobal('Debe seleccionar un proveedor');
      return;
    }
    if (
         lineas.some(
           (l) =>
              !l.idProducto ||
              !Number.isInteger(Number(l.cantidad)) ||
              Number(l.cantidad) <= 0 ||
              !l.precioUnitario ||
              Number(l.precioUnitario) <= 0,
                    )
    ) {
      setErrorGlobal(
        'Todas las líneas deben tener producto, cantidad mayor a 0 y precio unitario válido',
      );
      return;
    }

    const prodIds = lineas.map((l) => l.idProducto);
    if (new Set(prodIds).size !== prodIds.length) {
      setErrorGlobal('No puede agregar el mismo producto más de una vez en el mismo ingreso');
      return;
    }

    const payload: CrearIngresoInput = {
  nroIngreso: nroIngreso.trim(),
  idProveedor,
  fecha: fecha ? fecha : undefined,
  lineas: lineas.map((l) => ({
    idProducto: l.idProducto,
    cantidad: Number(l.cantidad),
    precioUnitario: l.precioUnitario,
  })),
};

    try {
      await crearMutation.mutateAsync(payload);
      setExitoGlobal('Ingreso registrado correctamente y stock actualizado');
      setModalNuevoOpen(false);
      // reset form
      setNroIngreso('');
      setIdProveedor(0);
      setFecha('');
      setLineas([{ idProducto: 0, cantidad: '1', precioUnitario: '' }]);
    } catch (err) {
      setErrorGlobal(getApiErrorMessage(err));
    }
  };

  const handleAnular = async (id: number) => {
    if (
      !window.confirm('¿Está seguro de que desea anular este ingreso? Se restará el stock acumulado.')
    )
      return;
    setErrorGlobal(null);
    setExitoGlobal(null);
    try {
      await anularMutation.mutateAsync(id);
      setExitoGlobal('Ingreso anulado exitosamente y stock restituido');
      if (idDetalle === id) setIdDetalle(null);
    } catch (err) {
      setErrorGlobal(getApiErrorMessage(err));
    }
  };

  const hayFiltros = Boolean(estadoFiltro || desdeFiltro || hastaFiltro);

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Ingresos de mercadería</h1>
          <p className="mt-2 text-slate-600">
            Registrá la entrada de productos para actualizar el stock contable.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setErrorGlobal(null);
            setExitoGlobal(null);
            setModalNuevoOpen(true);
          }}
          className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
        >
          Nuevo ingreso
        </button>
      </div>

      {errorGlobal && (
        <AdminBanner tone="error" className="mb-5">
          {errorGlobal}
        </AdminBanner>
      )}
      {exitoGlobal && (
        <AdminBanner tone="success" className="mb-5">
          {exitoGlobal}
        </AdminBanner>
      )}

      {/* Filtros */}
      <div
        role="group"
        aria-label="Filtros de ingresos"
        className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className={LABEL_CLASS}>
          Estado
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value as EstadoIngreso | '')}
            className={SELECT_CLASS}
          >
            <option value="">Todos</option>
            <option value="REGISTRADO">REGISTRADO</option>
            <option value="ANULADO">ANULADO</option>
          </select>
        </label>
        <label className={LABEL_CLASS}>
          Desde
          <input
            type="date"
            value={desdeFiltro}
            onChange={(e) => setDesdeFiltro(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        <label className={LABEL_CLASS}>
          Hasta
          <input
            type="date"
            value={hastaFiltro}
            onChange={(e) => setHastaFiltro(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        {hayFiltros && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setEstadoFiltro('');
                setDesdeFiltro('');
                setHastaFiltro('');
              }}
              className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Listado */}
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p>No se pudo cargar el listado: {getApiErrorMessage(error)}</p>
        </div>
      ) : respuestaIngresos?.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-semibold text-slate-800">No se encontraron ingresos de mercadería.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-bold">N° Comprobante</th>
                <th className="px-5 py-4 font-bold">Proveedor</th>
                <th className="px-5 py-4 font-bold">Fecha</th>
                <th className="px-5 py-4 font-bold">Importe total</th>
                <th className="px-5 py-4 font-bold">Estado</th>
                <th className="px-5 py-4 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {respuestaIngresos?.data.map((ingreso) => (
                <tr key={ingreso.id}>
                  <td className="px-5 py-4 font-semibold text-slate-900">{ingreso.nroIngreso}</td>
                  <td className="px-5 py-4 text-slate-700">{ingreso.proveedor.razonSocial}</td>
                  <td className="px-5 py-4 text-slate-700">
                    {new Date(ingreso.fecha).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-4 text-slate-700">{formatMoney(ingreso.importeTotal)}</td>
                  <td className="px-5 py-4">
                    <EstadoIngresoBadge estado={ingreso.estado} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIdDetalle(ingreso.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700"
                      >
                        Ver
                      </button>
                      {ingreso.estado === 'REGISTRADO' && (
                        <button
                          type="button"
                          onClick={() => handleAnular(ingreso.id)}
                          disabled={anularMutation.isPending}
                          className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 disabled:opacity-60"
                        >
                          Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalle */}
      {idDetalle && (
        <AdminModal
          labelledBy="admin-ingreso-detail-title"
          onClose={() => setIdDetalle(null)}
          panelClassName="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id="admin-ingreso-detail-title" className="text-xl font-bold text-slate-950">
              Detalle de ingreso N° {detalleIngreso?.nroIngreso}
            </h2>
            <button
              type="button"
              onClick={() => setIdDetalle(null)}
              aria-label="Cerrar detalle"
              className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
          {loadingDetalle ? (
            <Spinner />
          ) : !detalleIngreso ? (
            <p role="alert" className="py-8 text-red-700">
              No se pudo cargar el detalle.
            </p>
          ) : (
            <>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className={DT_CLASS}>Proveedor</dt>
                  <dd className="mt-1 text-slate-900">{detalleIngreso.proveedor.razonSocial}</dd>
                </div>
                <div>
                  <dt className={DT_CLASS}>Fecha</dt>
                  <dd className="mt-1 text-slate-900">
                    {new Date(detalleIngreso.fecha).toLocaleString('es-AR')}
                  </dd>
                </div>
                <div>
                  <dt className={DT_CLASS}>Estado</dt>
                  <dd className="mt-1">
                    <EstadoIngresoBadge estado={detalleIngreso.estado} />
                  </dd>
                </div>
                <div>
                  <dt className={DT_CLASS}>Importe total</dt>
                  <dd className="mt-1 font-bold text-slate-900">
                    {formatMoney(detalleIngreso.importeTotal)}
                  </dd>
                </div>
              </dl>

              <h3 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">
                Líneas de ingreso
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-bold">Producto</th>
                      <th className="px-4 py-3 text-center font-bold">Cantidad</th>
                      <th className="px-4 py-3 text-right font-bold">P. unitario</th>
                      <th className="px-4 py-3 text-right font-bold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalleIngreso.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {item.producto.nombre}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700">{item.cantidad}</td>
                        <td className="px-4 py-3 text-right text-slate-700">
                          {formatMoney(item.precioUnitario)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatMoney(item.importeLinea)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </AdminModal>
      )}

      {/* Modal Nuevo Ingreso */}
      {modalNuevoOpen && (
        <AdminModal
          labelledBy="admin-ingreso-new-title"
          onClose={() => setModalNuevoOpen(false)}
          panelClassName="max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id="admin-ingreso-new-title" className="text-xl font-bold text-slate-950">
              Registrar nuevo ingreso de mercadería
            </h2>
            <button
              type="button"
              onClick={() => setModalNuevoOpen(false)}
              aria-label="Cerrar formulario"
              className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitNuevo} className="mt-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className={LABEL_CLASS}>
                N° Comprobante/Ingreso *
                <input
                  type="text"
                  required
                  value={nroIngreso}
                  onChange={(e) => setNroIngreso(e.target.value)}
                  placeholder="Ej: ING-2026-001"
                  className={INPUT_CLASS}
                />
              </label>
              <label className={LABEL_CLASS}>
                Proveedor *
                <select
                  required
                  value={idProveedor}
                  onChange={(e) => setIdProveedor(Number(e.target.value))}
                  className={SELECT_CLASS}
                >
                  <option value={0}>Seleccionar proveedor...</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.razonSocial} (CUIT: {p.cuit})
                    </option>
                  ))}
                </select>
              </label>
              <label className={LABEL_CLASS}>
                Fecha (opcional)
                <input
                  type="datetime-local"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            {/* Sección de Líneas */}
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Líneas de productos
                </h3>
                <button
                  type="button"
                  onClick={handleAddLinea}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700"
                >
                  Agregar línea
                </button>
              </div>

              {lineas.map((line, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3"
                >
                  <div className="min-w-[200px] flex-1">
                    <select
                      required
                      aria-label={`Producto de la línea ${idx + 1}`}
                      value={line.idProducto}
                      onChange={(e) => handleLineaChange(idx, 'idProducto', Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"
                    >
                      <option value={0}>Seleccionar producto...</option>
                      {productos.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.nombre} (Stock actual: {prod.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min={1}
                      required
                      aria-label={`Cantidad de la línea ${idx + 1}`}
                      placeholder="Cant."
                      value={line.cantidad}
                      onChange={(e) => handleLineaChange(idx, 'cantidad', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal"
                    />
                  </div>
                  <div className="w-36">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      aria-label={`Precio unitario de la línea ${idx + 1}`}
                      placeholder="Precio unit. ($)"
                      value={line.precioUnitario}
                      onChange={(e) => handleLineaChange(idx, 'precioUnitario', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal"
                    />
                  </div>
                  {lineas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLinea(idx)}
                      aria-label={`Quitar línea ${idx + 1}`}
                      className="rounded-lg px-2 py-1 text-red-700 hover:bg-red-50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Total calculado
              </span>
              <span className="text-xl font-black text-slate-950">
                {formatMoney(calcularTotalNuevo().toFixed(2))}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={crearMutation.isPending}
                className="rounded-full bg-lime-300 px-5 py-2.5 font-bold text-slate-950 enabled:hover:bg-lime-400 disabled:opacity-60"
              >
                {crearMutation.isPending ? 'Guardando...' : 'Confirmar ingreso'}
              </button>
              <button
                type="button"
                onClick={() => setModalNuevoOpen(false)}
                className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </section>
  );
}
