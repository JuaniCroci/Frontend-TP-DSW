/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import AdminHomePage from '@/features/admin/pages/AdminHomePage';

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <AdminHomePage />
    </MemoryRouter>,
  );
}

describe('home de administración', () => {
  afterEach(() => {
    cleanup();
  });

  it('presenta el panel con su encabezado', () => {
    renderHome();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Administración' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Desde acá podés gestionar los datos principales de la tienda.'),
    ).toBeInTheDocument();
  });

  it('linkea cada sección del panel sin autorreferencia a Resumen', () => {
    renderHome();

    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href): href is string => href !== null);

    expect(hrefs).toEqual([
      '/admin/clientes',
      '/admin/productos',
      '/admin/descuentos',
      '/admin/marcas',
      '/admin/tipos-producto',
      '/admin/proveedores',
    ]);
  });

  it('describe cada sección dentro de su tarjeta', () => {
    renderHome();

    const tarjetaClientes = screen.getByRole('link', { name: /Clientes/ });
    expect(tarjetaClientes).toHaveTextContent('Consultá las cuentas y administrá su estado.');
    expect(tarjetaClientes).toHaveTextContent('Abrir sección →');
  });
});
