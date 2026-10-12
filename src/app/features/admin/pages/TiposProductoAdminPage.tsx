import { AdminMasterPage } from '../components/AdminMasterPage';

export default function TiposProductoAdminPage() {
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
