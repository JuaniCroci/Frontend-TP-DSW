import type { RegistroCatalogo } from '../../models/AdminCatalogo';

export function valueFor(record: RegistroCatalogo, field: string): string {
  const value = record[field as keyof RegistroCatalogo];
  return typeof value === 'string' ? value : '';
}
