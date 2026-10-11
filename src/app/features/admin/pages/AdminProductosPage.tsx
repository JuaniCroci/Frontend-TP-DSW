import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError } from '../../../core/api/apiError';
import type { Marca, TipoProducto } from '../../../models/Producto';
import type {
  ActualizarProductoAdmin,
  AdminProducto,
  CrearProductoAdmin,
} from '../../../models/AdminProducto';
import type { Proveedor } from '../../../models/AdminCatalogo';
import {
  useActualizarProductoAdmin,
  useCrearProductoAdmin,
  useDarDeBajaProductoAdmin,
} from '../api/productosMutations';
import {
  useAdminProductoDetalle,
  useAdminProductos,
  useProveedoresActivosProducto,
} from '../api/productosQueries';
import { useMarcasCatalogo, useTiposProductoCatalogo } from '../../products/api/queries';
import ProductoImagenesPanel from '../components/ProductoImagenesPanel';

const PAGE_SIZE = 20;

type EstadoProducto = 'todos' | 'activos' | 'inactivos';
type ModoFormulario = 'crear' | 'editar' | null;

interface FormularioProducto {
  nombre: string;
  descripcion: string;
  precioUnitario: string;
  stockInicial: string;
  idMarca: string;
  idTipoProducto: string;
  idProveedor: string;
}

interface ProductoFormProps {
  producto: AdminProducto | null;
  marcas: Marca[];
  tipos: TipoProducto[];
  proveedores: Proveedor[];
  mastersReady: boolean;
  onCancel: () => void;
  onSave: (data: CrearProductoAdmin | ActualizarProductoAdmin) => Promise<void>;
}

function getApiMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

function formatPrice(value: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function ProductoForm({
  producto,
  marcas,
  tipos,
  proveedores,
  mastersReady,
  onCancel,
  onSave,
}: ProductoFormProps) {
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormularioProducto>({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precioUnitario: producto?.precioUnitario ?? '',
      stockInicial: '',
      idMarca: producto ? String(producto.marca.id) : '',
      idTipoProducto: producto ? String(producto.tipoProducto.id) : '',
      idProveedor: producto?.proveedor ? String(producto.proveedor.id) : '',
    },
  });

  async function submit(form: FormularioProducto) {
    setFormError('');
    setFieldErrors({});

    try {
      if (!producto) {
        const data: CrearProductoAdmin = {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
          precioUnitario: form.precioUnitario,
          stockInicial: Number(form.stockInicial),
          idTipoProducto: Number(form.idTipoProducto),
          idMarca: Number(form.idMarca),
        };
        if (form.idProveedor) data.idProveedor = Number(form.idProveedor);
        await onSave(data);
        return;
      }

      const data: ActualizarProductoAdmin = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precioUnitario: form.precioUnitario,
      };
      if (Number(form.idTipoProducto) !== producto.tipoProducto.id) {
        data.idTipoProducto = Number(form.idTipoProducto);
      }
      if (Number(form.idMarca) !== producto.marca.id) {
        data.idMarca = Number(form.idMarca);
      }
      if (form.idProveedor === '' && producto.proveedor) {
        data.idProveedor = 0;
      } else if (form.idProveedor !== '' && Number(form.idProveedor) !== producto.proveedor?.id) {
        data.idProveedor = Number(form.idProveedor);
      }
      await onSave(data);
    } catch (error) {
      setFormError(getApiMessage(error));
      if (error instanceof ApiError && error.details) {
        setFieldErrors(
          Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])),
        );
      }
    }
  }

  function fieldError(name: keyof FormularioProducto): string | undefined {
    return String(errors[name]?.message ?? fieldErrors[name] ?? '') || undefined;
  }

  function registerField(name: keyof FormularioProducto) {
    return register(name, {
      required: `${name === 'precioUnitario' ? 'El precio' : 'Este campo'} es obligatorio.`,
    });
  }

  const needsUnavailableMarca = producto && !marcas.some((marca) => marca.id === producto.marca.id);
  const needsUnavailableTipo =
    producto && !tipos.some((tipo) => tipo.id === producto.tipoProducto.id);
  const needsUnavailableProveedor =
    producto?.proveedor &&
    !proveedores.some((proveedor) => proveedor.id === producto.proveedor?.id);

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-5 text-xl font-bold text-slate-900">
        {producto ? `Editar ${producto.nombre}` : 'Nuevo producto'}
      </h2>
      {!mastersReady && (
        <p role="alert" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          No se puede guardar hasta que se carguen correctamente las opciones de marca, tipo y
          proveedor.
        </p>
      )}
      {formError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {formError}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Nombre
          <input
            maxLength={255}
            {...register('nombre', {
              required: 'El nombre es obligatorio.',
              minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres.' },
              maxLength: { value: 255, message: 'El nombre admite hasta 255 caracteres.' },
            })}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            aria-invalid={Boolean(fieldError('nombre'))}
          />
          {fieldError('nombre') && (
            <span className="mt-1 block text-sm font-normal text-red-700">
              {fieldError('nombre')}
            </span>
          )}
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Precio unitario
          <input
            type="number"
            min="0.01"
            step="0.01"
            {...register('precioUnitario', {
              required: 'El precio es obligatorio.',
              validate: (value) =>
                /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0
                  ? true
                  : 'Ingresá un precio mayor a 0 con hasta dos decimales.',
            })}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            aria-invalid={Boolean(fieldError('precioUnitario'))}
          />
          {fieldError('precioUnitario') && (
            <span className="mt-1 block text-sm font-normal text-red-700">
              {fieldError('precioUnitario')}
            </span>
          )}
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
          Descripción
          <textarea
            maxLength={500}
            rows={3}
            {...register('descripcion', {
              maxLength: { value: 500, message: 'La descripción admite hasta 500 caracteres.' },
            })}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            aria-invalid={Boolean(fieldError('descripcion'))}
          />
          {fieldError('descripcion') && (
            <span className="mt-1 block text-sm font-normal text-red-700">
              {fieldError('descripcion')}
            </span>
          )}
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Tipo de producto
          <select
            {...registerField('idTipoProducto')}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
            aria-invalid={Boolean(fieldError('idTipoProducto'))}
            disabled={!mastersReady}
          >
            <option value="">Seleccioná un tipo</option>
            {needsUnavailableTipo && (
              <option value={producto.tipoProducto.id} disabled>
                {producto.tipoProducto.nombre} (inactivo)
              </option>
            )}
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {fieldError('idTipoProducto') && (
            <span className="mt-1 block text-sm font-normal text-red-700">
              {fieldError('idTipoProducto')}
            </span>
          )}
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Marca
          <select
            {...registerField('idMarca')}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
            aria-invalid={Boolean(fieldError('idMarca'))}
            disabled={!mastersReady}
          >
            <option value="">Seleccioná una marca</option>
            {needsUnavailableMarca && (
              <option value={producto.marca.id} disabled>
                {producto.marca.nombre} (inactiva)
              </option>
            )}
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
          {fieldError('idMarca') && (
            <span className="mt-1 block text-sm font-normal text-red-700">
              {fieldError('idMarca')}
            </span>
          )}
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Proveedor (opcional)
          <select
            {...register('idProveedor')}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
            aria-invalid={Boolean(fieldError('idProveedor'))}
            disabled={!mastersReady}
          >
            <option value="">Sin proveedor</option>
            {needsUnavailableProveedor && producto?.proveedor && (
              <option value={producto.proveedor.id} disabled>
                {producto.proveedor.razonSocial} (inactivo)
              </option>
            )}
            {proveedores.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.razonSocial}
              </option>
            ))}
          </select>
          {fieldError('idProveedor') && (
            <span className="mt-1 block text-sm font-normal text-red-700">
              {fieldError('idProveedor')}
            </span>
          )}
        </label>
        {producto ? (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            Stock actual: <strong className="text-slate-900">{producto.stock}</strong>. El stock no
            se modifica desde la edición del producto.
          </div>
        ) : (
          <label className="text-sm font-semibold text-slate-700">
            Stock inicial
            <input
              type="number"
              min="0"
              step="1"
              {...register('stockInicial', {
                required: 'El stock inicial es obligatorio.',
                validate: (value) =>
                  /^\d+$/.test(value) ? true : 'Ingresá un número entero mayor o igual a 0.',
              })}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              aria-invalid={Boolean(fieldError('stockInicial'))}
            />
            {fieldError('stockInicial') && (
              <span className="mt-1 block text-sm font-normal text-red-700">
                {fieldError('stockInicial')}
              </span>
            )}
          </label>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !mastersReady}
          className="rounded-full bg-lime-300 px-5 py-2.5 font-bold text-slate-950 enabled:hover:bg-lime-400 disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando...' : producto ? 'Guardar cambios' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            onCancel();
          }}
          className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function AdminProductosPage() {
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [searchSupplier, setSearchSupplier] = useState('');
  const [searchState, setSearchState] = useState<EstadoProducto>('todos');
  const [filters, setFilters] = useState({
    nombre: '',
    idTipoProducto: '',
    idMarca: '',
    idProveedor: '',
    estado: 'todos' as EstadoProducto,
    page: 1,
  });
  const [modo, setModo] = useState<ModoFormulario>(null);
  const [editing, setEditing] = useState<AdminProducto | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [imageProduct, setImageProduct] = useState<AdminProducto | null>(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const productos = useAdminProductos({
    nombre: filters.nombre || undefined,
    idTipoProducto: filters.idTipoProducto ? Number(filters.idTipoProducto) : undefined,
    idMarca: filters.idMarca ? Number(filters.idMarca) : undefined,
    idProveedor: filters.idProveedor ? Number(filters.idProveedor) : undefined,
    activo:
      filters.estado === 'activos' ? true : filters.estado === 'inactivos' ? false : undefined,
    page: filters.page,
    size: PAGE_SIZE,
  });
  const marcasQuery = useMarcasCatalogo();
  const tiposQuery = useTiposProductoCatalogo();
  const proveedoresQuery = useProveedoresActivosProducto();
  const detalle = useAdminProductoDetalle(detailId);
  const crear = useCrearProductoAdmin();
  const actualizar = useActualizarProductoAdmin();
  const darDeBaja = useDarDeBajaProductoAdmin();
  const marcas = (marcasQuery.data ?? []).filter((marca) => marca.activo);
  const tipos = (tiposQuery.data ?? []).filter((tipo) => tipo.activo);
  const proveedores = proveedoresQuery.data ?? [];
  const mastersReady =
    !marcasQuery.isLoading &&
    !tiposQuery.isLoading &&
    !proveedoresQuery.isLoading &&
    !marcasQuery.isError &&
    !tiposQuery.isError &&
    !proveedoresQuery.isError;
  const totalPages = Math.max(1, Math.ceil((productos.data?.total ?? 0) / PAGE_SIZE));

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({
      nombre: searchName.trim(),
      idTipoProducto: searchType,
      idMarca: searchBrand,
      idProveedor: searchSupplier,
      estado: searchState,
      page: 1,
    });
  }

  function startCreate() {
    setModo('crear');
    setEditing(null);
    setNotice('');
    setActionError('');
  }

  function startEdit(producto: AdminProducto) {
    setModo('editar');
    setEditing(producto);
    setNotice('');
    setActionError('');
  }

  function closeForm() {
    setModo(null);
    setEditing(null);
    setActionError('');
  }

  async function saveProduct(data: CrearProductoAdmin | ActualizarProductoAdmin) {
    if ('stockInicial' in data) {
      await crear.mutateAsync(data);
      setNotice('Producto creado correctamente.');
    } else if (modo === 'editar' && editing) {
      await actualizar.mutateAsync({ id: editing.id, data });
      setNotice('Producto actualizado correctamente.');
    } else {
      throw new Error('No se pudo determinar la operación para guardar el producto.');
    }
    closeForm();
  }

  async function deactivate(producto: AdminProducto) {
    if (
      !window.confirm(
        `¿Desactivar "${producto.nombre}"? Esta acción no se puede deshacer desde aquí.`,
      )
    ) {
      return;
    }
    setNotice('');
    setActionError('');
    try {
      await darDeBaja.mutateAsync(producto.id);
      setNotice('Producto desactivado correctamente.');
    } catch (error) {
      setActionError(getApiMessage(error));
    }
  }

  function changePage(page: number) {
    setFilters((current) => ({ ...current, page }));
  }

  function closeDetails() {
    setDetailId(null);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Productos</h1>
          <p className="mt-2 text-slate-600">
            Gestioná productos y sus relaciones con marcas, tipos y proveedores.
          </p>
        </div>
        {modo === null && (
          <button
            type="button"
            onClick={startCreate}
            className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-lime-700"
          >
            Crear producto
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
      {actionError && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {actionError}
        </p>
      )}

      {modo !== null && (
        <ProductoForm
          key={editing?.id ?? 'new'}
          producto={editing}
          marcas={marcas}
          tipos={tipos}
          proveedores={proveedores}
          mastersReady={mastersReady}
          onCancel={closeForm}
          onSave={saveProduct}
        />
      )}

      {(marcasQuery.isError || tiposQuery.isError || proveedoresQuery.isError) && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <p>No se pudieron cargar todas las opciones de relaciones:</p>
          <ul className="mt-2 list-inside list-disc text-sm">
            {marcasQuery.isError && <li>Marcas: {getApiMessage(marcasQuery.error)}</li>}
            {tiposQuery.isError && <li>Tipos: {getApiMessage(tiposQuery.error)}</li>}
            {proveedoresQuery.isError && (
              <li>Proveedores: {getApiMessage(proveedoresQuery.error)}</li>
            )}
          </ul>
        </div>
      )}

      <form
        onSubmit={applyFilters}
        className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <label className="text-sm font-semibold text-slate-700 lg:col-span-2">
          Buscar por nombre
          <input
            type="search"
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Tipo
          <select
            value={searchType}
            onChange={(event) => setSearchType(event.target.value)}
            disabled={marcasQuery.isLoading || tiposQuery.isLoading || tiposQuery.isError}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
          >
            <option value="">Todos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Marca
          <select
            value={searchBrand}
            onChange={(event) => setSearchBrand(event.target.value)}
            disabled={marcasQuery.isLoading || marcasQuery.isError}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
          >
            <option value="">Todas</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Proveedor
          <select
            value={searchSupplier}
            onChange={(event) => setSearchSupplier(event.target.value)}
            disabled={proveedoresQuery.isLoading || proveedoresQuery.isError}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
          >
            <option value="">Todos</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.razonSocial}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Estado
          <select
            value={searchState}
            onChange={(event) => setSearchState(event.target.value as EstadoProducto)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white"
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchName('');
              setSearchType('');
              setSearchBrand('');
              setSearchSupplier('');
              setSearchState('todos');
              setFilters({
                nombre: '',
                idTipoProducto: '',
                idMarca: '',
                idProveedor: '',
                estado: 'todos',
                page: 1,
              });
            }}
            className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
          >
            Limpiar
          </button>
        </div>
      </form>

      {productos.isLoading ? (
        <p role="status" className="py-12 text-center text-slate-600">
          Cargando productos...
        </p>
      ) : productos.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p>No se pudo cargar el listado: {getApiMessage(productos.error)}</p>
          <button
            type="button"
            onClick={() => void productos.refetch()}
            className="mt-3 rounded-full border border-red-300 px-4 py-2 font-semibold"
          >
            Reintentar
          </button>
        </div>
      ) : productos.data?.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-semibold text-slate-800">No hay productos para estos filtros.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Producto</th>
                  <th className="px-5 py-4 font-bold">Tipo</th>
                  <th className="px-5 py-4 font-bold">Marca</th>
                  <th className="px-5 py-4 font-bold">Precio</th>
                  <th className="px-5 py-4 font-bold">Stock</th>
                  <th className="px-5 py-4 font-bold">Estado</th>
                  <th className="px-5 py-4 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.data?.data.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{producto.nombre}</td>
                    <td className="px-5 py-4 text-slate-700">{producto.tipoProducto.nombre}</td>
                    <td className="px-5 py-4 text-slate-700">{producto.marca.nombre}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {formatPrice(producto.precioUnitario)}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{producto.stock}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${producto.activo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailId(producto.id)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(producto)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageProduct(producto)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700"
                        >
                          Imágenes
                        </button>
                        {producto.activo && (
                          <button
                            type="button"
                            onClick={() => void deactivate(producto)}
                            disabled={darDeBaja.isPending}
                            className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 disabled:opacity-60"
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
              {productos.data?.total ?? 0}{' '}
              {(productos.data?.total ?? 0) === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <nav aria-label="Paginación de productos" className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => changePage(filters.page - 1)}
              disabled={filters.page <= 1}
              className="rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-700 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="self-center text-sm text-slate-600">
              Página {filters.page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => changePage(filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-700 disabled:opacity-40"
            >
              Siguiente
            </button>
          </nav>
        </>
      )}

      {detailId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetails();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-product-detail-title"
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="admin-product-detail-title" className="text-xl font-bold text-slate-950">
                Detalle del producto
              </h2>
              <button
                type="button"
                onClick={closeDetails}
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
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Nombre
                  </dt>
                  <dd className="mt-1 text-slate-900">{detalle.data.nombre}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Estado
                  </dt>
                  <dd className="mt-1 text-slate-900">
                    {detalle.data.activo ? 'Activo' : 'Inactivo'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Tipo</dt>
                  <dd className="mt-1 text-slate-900">{detalle.data.tipoProducto.nombre}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Marca
                  </dt>
                  <dd className="mt-1 text-slate-900">{detalle.data.marca.nombre}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Precio
                  </dt>
                  <dd className="mt-1 text-slate-900">
                    {formatPrice(detalle.data.precioUnitario)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Stock actual
                  </dt>
                  <dd className="mt-1 text-slate-900">{detalle.data.stock}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Proveedor
                  </dt>
                  <dd className="mt-1 text-slate-900">
                    {detalle.data.proveedor?.razonSocial ?? 'Sin proveedor'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Descripción
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-slate-900">
                    {detalle.data.descripcion || '—'}
                  </dd>
                </div>
              </dl>
            ) : null}
          </section>
        </div>
      )}

      {imageProduct && (
        <ProductoImagenesPanel producto={imageProduct} onClose={() => setImageProduct(null)} />
      )}
    </section>
  );
}
