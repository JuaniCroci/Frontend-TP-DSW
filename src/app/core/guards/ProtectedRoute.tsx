import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Spinner } from '../../shared/components/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth();

  if (status === 'loading') return <Spinner />;
  if (status === 'anonymous') return <Navigate to="/login" replace />;
  return children;
}
