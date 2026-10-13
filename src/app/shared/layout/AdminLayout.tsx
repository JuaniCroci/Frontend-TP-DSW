import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { adminSections } from '../../features/admin/adminSections';
import { Spinner } from '../components/Spinner';
import { cn } from '../utils/cn';

export function AdminLayout() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <nav aria-label="Secciones de administración" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 py-3">
          {adminSections.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              end={section.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                )
              }
            >
              {section.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
