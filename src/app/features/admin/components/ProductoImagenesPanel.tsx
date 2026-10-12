import { useRef, useState } from 'react';
import { apiAssetUrl } from '../../../core/api/api.client';
import type { AdminProducto } from '../../../models/AdminProducto';
import { useSubirImagenProductoAdmin } from '../api/productosMutations';
import { useImagenesProductoAdmin } from '../api/productosQueries';

interface ProductoImagenesPanelProps {
  producto: AdminProducto;
  onClose: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

function formatSize(sizeBytes: number): string {
  return `${(sizeBytes / 1024).toFixed(0)} KiB`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

export function ProductoImagenesPanel({ producto, onClose }: ProductoImagenesPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState(
    producto.imagenPrincipal?.altText ?? `Imagen de ${producto.nombre}`,
  );
  const [fuente, setFuente] = useState('Fotografía propia');
  const [licencia, setLicencia] = useState(
    'Fotografía propia para uso académico; autorización de marca pendiente.',
  );
  const [atribucion, setAtribucion] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagenes = useImagenesProductoAdmin(producto.id);
  const subirImagen = useSubirImagenProductoAdmin();

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setNotice('');

    if (!file) {
      setFormError('Seleccioná una imagen para cargar.');
      return;
    }
    if (!IMAGE_TYPES.includes(file.type)) {
      setFormError('El archivo debe ser PNG, JPEG o WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setFormError('La imagen no puede superar los 5 MiB.');
      return;
    }
    if (!altText.trim() || !fuente.trim() || !licencia.trim()) {
      setFormError('Completá el texto alternativo, la fuente y la licencia.');
      return;
    }

    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('altText', altText.trim());
    formData.append('fuente', fuente.trim());
    formData.append('licencia', licencia.trim());
    if (atribucion.trim()) formData.append('atribucion', atribucion.trim());

    try {
      await subirImagen.mutateAsync({ id: producto.id, formData });
      setFile(null);
      setNotice('Imagen cargada y establecida como principal.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  const currentImage =
    imagenes.data?.find((imagen) => imagen.esPrincipal) ?? producto.imagenPrincipal;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="producto-imagenes-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-lime-700">
              Registro de fotos
            </p>
            <h2 id="producto-imagenes-title" className="mt-1 text-xl font-bold text-slate-950">
              {producto.nombre}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar imágenes"
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {currentImage && (
          <div className="mt-5 flex gap-4 rounded-xl bg-slate-50 p-4">
            <img
              src={apiAssetUrl(currentImage.url)}
              alt={currentImage.altText}
              className="h-28 w-24 rounded-lg bg-white object-contain"
            />
            <div className="self-center">
              <p className="font-semibold text-slate-900">Imagen principal actual</p>
              <p className="mt-1 text-sm text-slate-600">
                Al cargar otra imagen, esta quedará en el historial.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Archivo de imagen
            <input
              id="producto-imagen-file"
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-2 font-normal"
              aria-describedby="producto-imagen-help"
            />
            {file && <span className="ml-2 text-xs font-normal text-slate-600">{file.name}</span>}
            <span id="producto-imagen-help" className="mt-1 block font-normal text-slate-500">
              PNG, JPEG o WebP; máximo 5 MiB. El nombre se reemplaza por un UUID.
            </span>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Texto alternativo
            <input
              required
              maxLength={255}
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Fuente
            <input
              required
              maxLength={255}
              value={fuente}
              onChange={(event) => setFuente(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Licencia / permiso
            <input
              required
              maxLength={255}
              value={licencia}
              onChange={(event) => setLicencia(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Atribución (opcional)
            <input
              maxLength={500}
              value={atribucion}
              onChange={(event) => setAtribucion(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>
          {formError && (
            <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {formError}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="sm:col-span-2 rounded-lg bg-green-50 p-3 text-sm text-green-800"
            >
              {notice}
            </p>
          )}
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={subirImagen.isPending}
              className="rounded-full bg-lime-300 px-5 py-2.5 font-bold text-slate-950 disabled:opacity-60"
            >
              {subirImagen.isPending ? 'Cargando...' : 'Cargar imagen'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
            >
              Cerrar
            </button>
          </div>
        </form>

        <section
          aria-labelledby="producto-imagenes-history"
          className="mt-8 border-t border-slate-200 pt-6"
        >
          <h3 id="producto-imagenes-history" className="font-bold text-slate-950">
            Historial de imágenes
          </h3>
          {imagenes.isLoading ? (
            <p role="status" className="py-5 text-sm text-slate-600">
              Cargando historial...
            </p>
          ) : imagenes.isError ? (
            <p role="alert" className="py-5 text-sm text-red-700">
              No se pudo cargar el historial: {getErrorMessage(imagenes.error)}
            </p>
          ) : imagenes.data?.length ? (
            <ul className="mt-4 space-y-3">
              {imagenes.data.map((imagen) => (
                <li key={imagen.id} className="flex gap-4 rounded-xl border border-slate-200 p-3">
                  <img
                    src={apiAssetUrl(imagen.url)}
                    alt={imagen.altText}
                    className="h-20 w-16 rounded-lg bg-slate-50 object-contain"
                  />
                  <div className="min-w-0 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">
                      {imagen.esPrincipal ? 'Principal actual' : 'Imagen anterior'} ·{' '}
                      {formatDate(imagen.createdAt)}
                    </p>
                    <p className="mt-1">Fuente: {imagen.fuente}</p>
                    <p>Licencia: {imagen.licencia}</p>
                    {imagen.atribucion && <p>Atribución: {imagen.atribucion}</p>}
                    <p>{formatSize(imagen.sizeBytes)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600">Todavía no hay imágenes registradas.</p>
          )}
        </section>
      </section>
    </div>
  );
}
