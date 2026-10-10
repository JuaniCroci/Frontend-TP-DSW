import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './app/core/auth/AuthProvider.tsx';
import LoginPage from './app/features/auth/pages/LoginPage.tsx';
import HomePage from './app/features/home/pages/HomePage.tsx';
import CatalogoPage from './app/features/products/pages/CatalogoPage.tsx';
import ProductoDetallePage from './app/features/products/pages/ProductoDetallePage.tsx';
import AdminHomePage from './app/features/admin/pages/AdminHomePage.tsx';
import AdminClientesPage from './app/features/admin/pages/AdminClientesPage.tsx';
import {
  MarcasAdminPage,
  ProveedoresAdminPage,
  TiposProductoAdminPage,
} from './app/features/admin/pages/AdminCatalogoPages.tsx';
import { AdminRoute } from './app/core/guards/AdminRoute.tsx';
import { AdminLayout } from './app/shared/layout/AdminLayout.tsx';
import { MainLayout } from './app/shared/layout/MainLayout.tsx';

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
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminHomePage />} />
                  <Route path="clientes" element={<AdminClientesPage />} />
                  <Route path="marcas" element={<MarcasAdminPage />} />
                  <Route path="tipos-producto" element={<TiposProductoAdminPage />} />
                  <Route path="proveedores" element={<ProveedoresAdminPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
