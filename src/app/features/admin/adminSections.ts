export interface AdminSection {
  to: string;
  label: string;
  end?: boolean;
  description: string;
}

export const adminSections: AdminSection[] = [
  {
    to: '/admin',
    label: 'Resumen',
    end: true,
    description: 'Vista general del panel de gestión.',
  },
  {
    to: '/admin/clientes',
    label: 'Clientes',
    description: 'Consultá las cuentas y administrá su estado.',
  },
  {
    to: '/admin/productos',
    label: 'Productos',
    description: 'Administrá productos, precios, relaciones y stock inicial.',
  },
  {
    to: '/admin/descuentos',
    label: 'Descuentos',
    description: 'Definí descuentos por cantidad y su vigencia para cada producto.',
  },
  {
    to: '/admin/marcas',
    label: 'Marcas',
    description: 'Administrá las marcas disponibles para el catálogo.',
  },
  {
    to: '/admin/tipos-producto',
    label: 'Tipos de producto',
    description: 'Organizá los productos por tipo.',
  },
  {
    to: '/admin/proveedores',
    label: 'Proveedores',
    description: 'Mantené los datos de tus proveedores.',
  },
];
