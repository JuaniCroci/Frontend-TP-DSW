import { cn } from '../utils/cn';

interface EstadoBadgeProps {
  activo: boolean;
}

export function EstadoBadge({ activo }: EstadoBadgeProps) {
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-xs font-bold',
        activo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500',
      )}
    >
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}
