import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, roleHomePath, type Role } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isLoggedIn, role } = useAuth();

  // Not logged in → back to landing
  if (!isLoggedIn || !role) return <Navigate to="/" replace />;

  // Admin bypasses all restrictions
  if (role === 'admin') return <>{children}</>;

  // Wrong role → redirect to own home
  if (!allowedRoles.includes(role)) {
    return <Navigate to={roleHomePath(role)} replace />;
  }

  return <>{children}</>;
}
