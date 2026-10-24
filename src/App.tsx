import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './app/core/auth/AuthProvider.tsx';
import LoginPage from './app/features/auth/pages/LoginPage.tsx';
import HomePage from './app/features/home/pages/HomePage.tsx';
import CatalogoPage from './app/features/products/pages/CatalogoPage.tsx';
import ProductoDetallePage from './app/features/products/pages/ProductoDetallePage.tsx';
import CarritoPage from './app/features/cart/pages/CarritoPage.tsx';
import { AdminRoute } from './app/core/guards/AdminRoute.tsx';
import { ClientRoute } from './app/core/guards/ClientRoute.tsx';
import { AdminLayout } from './app/shared/layout/AdminLayout.tsx';
import { MainLayout } from './app/shared/layout/MainLayout.tsx';
import { Spinner } from './app/shared/components/Spinner.tsx';
import IngresosAdminPage from '@/features/admin/pages/IngresoAdminPage.tsx';

const RegisterPage = lazy(() => import('./app/features/auth/pages/RegisterPage.tsx'));
const AdminHomePage = lazy(() => import('./app/features/admin/pages/AdminHomePage.tsx'));
const AdminClientesPage = lazy(() => import('./app/features/admin/pages/AdminClientesPage.tsx'));
const AdminProductosPage = lazy(() => import('./app/features/admin/pages/AdminProductosPage.tsx'));
const AdminDescuentosPage = lazy(
  () => import('./app/features/admin/pages/AdminDescuentosPage.tsx'),
);
const MarcasAdminPage = lazy(() => import('./app/features/admin/pages/MarcasAdminPage.tsx'));
const TiposProductoAdminPage = lazy(
  () => import('./app/features/admin/pages/TiposProductoAdminPage.tsx'),
);
const ProveedoresAdminPage = lazy(
  () => import('./app/features/admin/pages/ProveedoresAdminPage.tsx'),
);
const MisPedidosPage = lazy(() => import('./app/features/orders/pages/MisPedidosPage.tsx'));
const AdminPedidosPage = lazy(() => import('./app/features/orders/pages/AdminPedidosPage.tsx'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/productos" element={<CatalogoPage />} />
              <Route path="/productos/:id" element={<ProductoDetallePage />} />
              <Route element={<ClientRoute />}>
                <Route path="/carrito" element={<CarritoPage />} />
                <Route
                  path="/mis-pedidos"
                  element={
                    <Suspense fallback={<Spinner />}>
                      <MisPedidosPage />
                    </Suspense>
                  }
                />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminHomePage />} />
                  <Route path="clientes" element={<AdminClientesPage />} />
                  <Route path="productos" element={<AdminProductosPage />} />
                  <Route path="descuentos" element={<AdminDescuentosPage />} />
                  <Route path="ingresos" element={<IngresosAdminPage />} />
                  <Route
                    path="pedidos"
                    element={
                      <Suspense fallback={<Spinner />}>
                        <AdminPedidosPage />
                      </Suspense>
                    }
                  />
                  <Route path="marcas" element={<MarcasAdminPage />} />
                  <Route path="tipos-producto" element={<TiposProductoAdminPage />} />
                  <Route path="proveedores" element={<ProveedoresAdminPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/registro"
              element={
                <Suspense fallback={<Spinner />}>
                  <RegisterPage />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
