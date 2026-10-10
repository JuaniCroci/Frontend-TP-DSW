import { Link } from 'react-router-dom';

const sections = [
  {
    to: '/admin/marcas',
    title: 'Marcas',
    description: 'Administrá las marcas disponibles para el catálogo.',
  },
  {
    to: '/admin/tipos-producto',
    title: 'Tipos de producto',
    description: 'Organizá los productos por tipo.',
  },
  {
    to: '/admin/proveedores',
    title: 'Proveedores',
    description: 'Mantené los datos de tus proveedores.',
  },
];

export default function AdminHomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-700">
        Panel de gestión
      </p>
      <h1 className="mt-2 text-4xl font-black text-slate-950">Administración</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Desde acá podés gestionar los datos principales de la tienda.
      </p>
      <div className="mt-9 grid gap-5 md:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{section.description}</p>
            <span className="mt-6 inline-block font-bold text-lime-800">Abrir sección →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
