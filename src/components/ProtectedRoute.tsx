import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn, isAdmin } from '../services/loginService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/manufacturing" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;