import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'staff' | 'resident';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && user?.role !== 'admin' && user?.role !== 'staff') {
    return <Navigate to="/resident/dashboard" replace />;
  }

  if (requiredRole === 'resident' && user?.role !== 'resident') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};
