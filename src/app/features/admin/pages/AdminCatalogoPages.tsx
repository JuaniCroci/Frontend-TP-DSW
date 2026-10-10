import { AdminMasterPage } from '../components/AdminMasterPage';

export function MarcasAdminPage() {
  return (
    <AdminMasterPage
      resource="marcas"
      title="Marcas"
      description="Creá y mantené las marcas asociadas a los productos."
      nameField="nombre"
      fields={[{ name: 'nombre', label: 'Nombre', required: true, minLength: 2, maxLength: 80 }]}
    />
  );
}

export function TiposProductoAdminPage() {
  return (
    <AdminMasterPage
      resource="tipos-producto"
      title="Tipos de producto"
      description="Definí las categorías que organizan el catálogo."
      nameField="nombre"
      fields={[
        { name: 'nombre', label: 'Nombre', required: true, minLength: 2, maxLength: 80 },
        { name: 'descripcion', label: 'Descripción', maxLength: 500 },
      ]}
    />
  );
}

export function ProveedoresAdminPage() {
  return (
    <AdminMasterPage
      resource="proveedores"
      title="Proveedores"
      description="Administrá los datos de contacto y facturación de proveedores."
      nameField="razonSocial"
      fields={[
        { name: 'razonSocial', label: 'Razón social', required: true, maxLength: 255 },
        {
          name: 'cuit',
          label: 'CUIT (11 dígitos)',
          required: true,
          maxLength: 11,
          pattern: /^\d{11}$/,
          patternMessage: 'El CUIT debe tener exactamente 11 dígitos.',
        },
        { name: 'telefono', label: 'Teléfono', type: 'tel' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'domicilio', label: 'Domicilio', maxLength: 255 },
      ]}
    />
  );
}
