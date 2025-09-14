/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * Route-Based Access Control Guard with Redirects
 * State-of-the-Art 2025 Implementation
 */

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../AuthContext';
import { validateRole } from '@/features/auth/utils/rbac';
import { Role } from '@/features/auth';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
  fallbackPath?: string;
}

export function RouteGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/',
  fallbackPath = '/unauthorized'
}: RouteGuardProps) {
  const { user, isLoading } = useAuthContext();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;
    
    // Get validated user role
    const userRole = validateRole(user?.role);
    
    // Check if user has required role
    const hasAccess = userRole && allowedRoles.includes(userRole);
    
    // Redirect if no access
    if (!hasAccess) {
      // Use fallbackPath for better UX (avoids 403 leakage)
      setLocation(user ? fallbackPath : redirectTo);
    }
  }, [user, isLoading, allowedRoles, redirectTo, fallbackPath, setLocation]);
  
  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Get validated user role
  const userRole = validateRole(user?.role);
  
  // Check if user has required role
  const hasAccess = userRole && allowedRoles.includes(userRole);
  
  // Return children only if access is granted
  return hasAccess ? <>{children}</> : null;
}

// Convenience components for common route protection
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard 
      allowedRoles={['admin']} 
      redirectTo="/login"
      fallbackPath="/"
    >
      {children}
    </RouteGuard>
  );
}

export function ProUserRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard 
      allowedRoles={['admin', 'pro_user']} 
      redirectTo="/login"
      fallbackPath="/"
    >
      {children}
    </RouteGuard>
  );
}
