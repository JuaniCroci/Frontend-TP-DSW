import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function AdminRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.rol !== 'ADMIN') return <Navigate to="/" replace />;

  return <Outlet />;
}
