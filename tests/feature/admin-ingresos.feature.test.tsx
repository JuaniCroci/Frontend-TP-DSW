/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { InternalAxiosRequestConfig } from 'axios';
import { response, requestBody } from '../helpers/axios-adapter';
import { saveSession } from '../helpers/session';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/core/api/api.client';
import IngresosAdminPage from '@/features/admin/pages/IngresoAdminPage';

const adapterOriginal = apiClient.defaults.adapter;

const proveedor = {
  id: 3,
  razonSocial: 'Suplementos SA',
  cuit: '30-12345678-9',
  telefono: null,
  email: null,
  domicilio: null,
  activo: true,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
};

const productos = [
  { id: 21, nombre: 'Creatina', stock: 10, activo: true },
  { id: 22, nombre: 'Proteína', stock: 4, activo: true },
];

const ingreso = {
  id: 5,
  nroIngreso: 'ING-2026-001',
  fecha: '2026-10-10T15:00:00.000Z',
  importeTotal: '25000.00',
  estado: 'REGISTRADO' as const,
  proveedor: { id: 3, razonSocial: 'Suplementos SA' },
  createdAt: '2026-10-10T15:00:00.000Z',
  updatedAt: '2026-10-10T15:00:00.000Z',
};

const ingresoDetalle = {
  ...ingreso,
  items: [
    {
      id: 1,
      idProducto: 21,
      producto: { id: 21, nombre: 'Creatina' },
      cantidad: 5,
      precioUnitario: '5000.00',
      importeLinea: '25000.00',
    },
  ],
};

function responderCatalogos(config: InternalAxiosRequestConfig) {
  if (config.url === '/api/proveedores' && config.method === 'get') {
    return response(config, { data: [proveedor], total: 1 });
  }
  if (config.url === '/api/productos/admin' && config.method === 'get') {
    return response(config, { data: productos, total: productos.length, page: 1, size: 100 });
  }
  return null;
}

function renderIngresosPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/ingresos']}>
        <Routes>
          <Route path="/admin/ingresos" element={<IngresosAdminPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function abrirFormularioNuevo() {
  fireEvent.click(screen.getByRole('button', { name: 'Nuevo ingreso' }));
  await screen.findByRole('dialog', { name: /Registrar nuevo ingreso/ });
  await screen.findByRole('option', { name: /Suplementos SA/ });
  await screen.findByRole('option', { name: /Creatina/ });
}

describe('administración de ingresos de mercadería', () => {
  beforeEach(() => {
    localStorage.clear();
    saveSession('ADMIN');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    apiClient.defaults.adapter = adapterOriginal;
    vi.restoreAllMocks();
  });

  it('lista los ingresos con comprobante, proveedor, importe y estado', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: [ingreso], total: 1 });
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();

    const fila = (await screen.findByText('ING-2026-001')).closest('tr');
    expect(fila).not.toBeNull();
    expect(within(fila as HTMLElement).getByText('Suplementos SA')).toBeInTheDocument();
    expect(within(fila as HTMLElement).getByText('REGISTRADO')).toBeInTheDocument();
    expect(within(fila as HTMLElement).getByRole('button', { name: 'Anular' })).toBeInTheDocument();
  });

  it('muestra un mensaje cuando todavía no hay ingresos', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();

    expect(
      await screen.findByText('No se encontraron ingresos de mercadería.'),
    ).toBeInTheDocument();
  });

  it('envía el estado elegido como filtro al listado', async () => {
    const filtrosEnviados: unknown[] = [];
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        filtrosEnviados.push(config.params);
        return response(config, { data: [ingreso], total: 1 });
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();
    await screen.findByText('ING-2026-001');
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'ANULADO' } });

    await vi.waitFor(() => expect(filtrosEnviados).toContainEqual({ estado: 'ANULADO' }));
  });

  it('muestra el detalle de un ingreso con sus líneas', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: [ingreso], total: 1 });
      }
      if (config.url === '/api/ingresos/5' && config.method === 'get') {
        return response(config, ingresoDetalle);
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();
    await screen.findByText('ING-2026-001');
    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));

    const dialogo = await screen.findByRole('dialog', {
      name: /Detalle de ingreso N° ING-2026-001/,
    });
    expect(await within(dialogo).findByText('Creatina')).toBeInTheDocument();
    expect(within(dialogo).getByText('Líneas de ingreso')).toBeInTheDocument();
  });

  it('crea un ingreso enviando cantidad como número y precio como texto', async () => {
    let ingresos: (typeof ingreso)[] = [];
    let createBody: unknown;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: ingresos, total: ingresos.length });
      }
      if (config.url === '/api/ingresos' && config.method === 'post') {
        createBody = requestBody(config.data);
        ingresos = [ingreso];
        return response(config, ingresoDetalle, 201);
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();
    await screen.findByText('No se encontraron ingresos de mercadería.');
    await abrirFormularioNuevo();

    fireEvent.change(screen.getByLabelText('N° Comprobante/Ingreso *'), {
      target: { value: '  ING-2026-001  ' },
    });
    fireEvent.change(screen.getByLabelText('Proveedor *'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Producto de la línea 1'), {
      target: { value: '21' },
    });
    fireEvent.change(screen.getByLabelText('Cantidad de la línea 1'), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText('Precio unitario de la línea 1'), {
      target: { value: '5000.00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar ingreso' }));

    expect(
      await screen.findByText('Ingreso registrado correctamente y stock actualizado'),
    ).toBeInTheDocument();
    expect(createBody).toEqual({
      nroIngreso: 'ING-2026-001',
      idProveedor: 3,
      lineas: [{ idProducto: 21, cantidad: 5, precioUnitario: '5000.00' }],
    });
    expect(await screen.findByText('ING-2026-001')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calcula el total del ingreso a medida que se cargan las líneas', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();
    await screen.findByText('No se encontraron ingresos de mercadería.');
    await abrirFormularioNuevo();

    fireEvent.change(screen.getByLabelText('Cantidad de la línea 1'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Precio unitario de la línea 1'), {
      target: { value: '100.50' },
    });

    expect(screen.getByText(/301,50/)).toBeInTheDocument();
  });

  it('rechaza el mismo producto repetido en dos líneas sin llamar a la API', async () => {
    const posts: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      if (config.url === '/api/ingresos' && config.method === 'post') {
        posts.push(config.url);
        return response(config, ingresoDetalle, 201);
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();
    await screen.findByText('No se encontraron ingresos de mercadería.');
    await abrirFormularioNuevo();

    fireEvent.change(screen.getByLabelText('N° Comprobante/Ingreso *'), {
      target: { value: 'ING-9' },
    });
    fireEvent.change(screen.getByLabelText('Proveedor *'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar línea' }));
    for (const linea of [1, 2]) {
      fireEvent.change(screen.getByLabelText(`Producto de la línea ${linea}`), {
        target: { value: '21' },
      });
      fireEvent.change(screen.getByLabelText(`Cantidad de la línea ${linea}`), {
        target: { value: '2' },
      });
      fireEvent.change(screen.getByLabelText(`Precio unitario de la línea ${linea}`), {
        target: { value: '10' },
      });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar ingreso' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No puede agregar el mismo producto más de una vez en el mismo ingreso',
    );
    expect(posts).toEqual([]);
  });

  it('muestra el error devuelto por la API al confirmar el ingreso', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      if (config.url === '/api/ingresos' && config.method === 'post') {
        return Promise.reject({
          isAxiosError: true,
          config,
          response: {
            data: { statusCode: 409, message: 'Ya existe un ingreso con ese número' },
            status: 409,
            statusText: 'Conflict',
            headers: {},
          },
        });
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();
    await screen.findByText('No se encontraron ingresos de mercadería.');
    await abrirFormularioNuevo();

    fireEvent.change(screen.getByLabelText('N° Comprobante/Ingreso *'), {
      target: { value: 'ING-1' },
    });
    fireEvent.change(screen.getByLabelText('Proveedor *'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Producto de la línea 1'), {
      target: { value: '21' },
    });
    fireEvent.change(screen.getByLabelText('Precio unitario de la línea 1'), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar ingreso' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe un ingreso con ese número',
    );
  });

  it('mantiene el foco en el campo mientras se escribe en el formulario', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();
    await screen.findByText('No se encontraron ingresos de mercadería.');
    await abrirFormularioNuevo();

    const comprobante = screen.getByLabelText('N° Comprobante/Ingreso *');
    comprobante.focus();
    for (const texto of ['1', '12', '123']) {
      fireEvent.change(comprobante, { target: { value: texto } });
      expect(comprobante).toHaveFocus();
    }

    const cantidad = screen.getByLabelText('Cantidad de la línea 1');
    cantidad.focus();
    fireEvent.change(cantidad, { target: { value: '45' } });
    expect(cantidad).toHaveFocus();
  });

  it('permite borrar la cantidad por completo sin que quede un cero fijo', async () => {
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: [], total: 0 });
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();
    await screen.findByText('No se encontraron ingresos de mercadería.');
    await abrirFormularioNuevo();

    const cantidad = screen.getByLabelText('Cantidad de la línea 1');
    expect(cantidad).toHaveValue(1);

    fireEvent.change(cantidad, { target: { value: '' } });
    expect(cantidad).toHaveValue(null);

    fireEvent.change(cantidad, { target: { value: '7' } });
    expect(cantidad).toHaveValue(7);
  });

  it('anula un ingreso registrado tras confirmar', async () => {
    let estado: 'REGISTRADO' | 'ANULADO' = 'REGISTRADO';
    const anulaciones: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: [{ ...ingreso, estado }], total: 1 });
      }
      if (config.url === '/api/ingresos/5/anular' && config.method === 'post') {
        anulaciones.push(config.url);
        estado = 'ANULADO';
        return response(config, { ...ingresoDetalle, estado });
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();
    await screen.findByText('ING-2026-001');
    fireEvent.click(screen.getByRole('button', { name: 'Anular' }));

    expect(
      await screen.findByText('Ingreso anulado exitosamente y stock restituido'),
    ).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(anulaciones).toEqual(['/api/ingresos/5/anular']);
    const fila = screen.getByText('ING-2026-001').closest('tr') as HTMLElement;
    expect(await within(fila).findByText('ANULADO')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Anular' })).not.toBeInTheDocument();
  });

  it('no anula el ingreso si se cancela la confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const anulaciones: string[] = [];
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/api/ingresos' && config.method === 'get') {
        return response(config, { data: [ingreso], total: 1 });
      }
      if (config.method === 'post') {
        anulaciones.push(String(config.url));
        return response(config, ingresoDetalle);
      }
      const catalogo = responderCatalogos(config);
      if (catalogo) return catalogo;
      throw new Error(`Request inesperado: ${config.method} ${config.url}`);
    };

    renderIngresosPage();
    await screen.findByText('ING-2026-001');
    fireEvent.click(screen.getByRole('button', { name: 'Anular' }));

    expect(window.confirm).toHaveBeenCalledOnce();
    expect(anulaciones).toEqual([]);
  });
});
