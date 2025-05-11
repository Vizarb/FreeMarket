import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

interface RoleProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles: string[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { authLoaded, isAuthenticated, hasGroup, isAdmin } = useAuth();
  const location = useLocation();

  if (!authLoaded) {
    return <p>Loading…</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRole = isAdmin || allowedRoles.some(hasGroup);
  if (!hasRole) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
