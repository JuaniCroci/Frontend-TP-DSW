import { AdminMasterPage } from '../components/AdminMasterPage';

export default function MarcasAdminPage() {
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
