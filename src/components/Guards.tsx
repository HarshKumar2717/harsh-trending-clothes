import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from './ui';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  // If a non-user role somehow lands on a customer route, send them to access-denied
  if (profile && (profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN')) {
    return <Navigate to="/access-denied" replace />;
  }
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  if (profile?.role !== 'SUPER_ADMIN') return <Navigate to="/access-denied" replace />;
  return <>{children}</>;
}
