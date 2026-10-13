import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError } from '../../../core/api/apiError';
import { getApiErrorMessage } from '../../../core/api/friendlyError';
import type { Marca } from '../../../models/Marca';
import type { TipoProducto } from '../../../models/TipoProducto';
import type {
  ActualizarProductoAdmin,
  AdminProducto,
  CrearProductoAdmin,
} from '../../../models/AdminProducto';
import type { Proveedor } from '../../../models/AdminCatalogo';

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

export function ProductoForm({
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

  async function handleFormSubmit(form: FormularioProducto) {
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
      setFormError(getApiErrorMessage(error));
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
      onSubmit={handleSubmit(handleFormSubmit)}
      aria-label="Formulario de producto"
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
