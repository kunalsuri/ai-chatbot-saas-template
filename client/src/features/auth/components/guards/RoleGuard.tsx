/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * Role-Based Access Control Guard Component
 * State-of-the-Art 2025 Implementation
 */

import React from 'react';
import { useAuth } from '../AuthContext';
import { validateRole } from '@/features/auth/utils/rbac';
import { Role } from '@/features/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  redirectTo
}: RoleGuardProps) {
  const { user, isLoading } = useAuthContext();

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get validated user role
  const userRole = validateRole(user?.role);

  // Check if user has required role
  const hasAccess = userRole && allowedRoles.includes(userRole);

  // Handle redirect if specified and no access
  if (!hasAccess && redirectTo) {
    // Use wouter's programmatic navigation
    window.location.replace(redirectTo);
    return null;
  }

  // Return children if access granted, otherwise fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function ProUserOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin', 'pro_user']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
