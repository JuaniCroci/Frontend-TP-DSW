import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface AdminBannerProps {
  tone: 'success' | 'error';
  className?: string;
  children: ReactNode;
}

export function AdminBanner({ tone, className, children }: AdminBannerProps) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl border p-4',
        tone === 'success'
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-red-200 bg-red-50 text-red-800',
        className,
      )}
    >
      {children}
    </p>
  );
}
