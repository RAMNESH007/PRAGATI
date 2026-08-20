import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['ADMIN', 'OPERATOR'] 
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If Operator tries to access Admin route
  if (allowedRoles.includes('ADMIN') && !allowedRoles.includes('OPERATOR') && user.role !== 'ADMIN') {
    return <Navigate to="/operator/dashboard" replace />;
  }

  return <>{children}</>;
};
