import { useState } from 'react';
import { apiAssetUrl } from '../../../core/api/api.client';
import type { ImagenPrincipalProducto } from '../../../models/Producto';

interface ProductoImagenProps {
  imagen: ImagenPrincipalProducto | null | undefined;
  className: string;
  imageClassName?: string;
}

export function ProductoImagen({
  imagen,
  className,
  imageClassName = 'h-full w-full object-contain',
}: ProductoImagenProps) {
  const [failedImageId, setFailedImageId] = useState<string | null>(null);
  if (!imagen || imagen.id === failedImageId) {
    return (
      <div className={className} role="img" aria-label="Sin imagen disponible">
        <span aria-hidden="true" className="text-5xl font-black tracking-tight text-slate-300">
          E.
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={apiAssetUrl(imagen.url)}
        alt={imagen.altText}
        className={imageClassName}
        loading="lazy"
        decoding="async"
        onError={() => setFailedImageId(imagen.id)}
      />
    </div>
  );
}
