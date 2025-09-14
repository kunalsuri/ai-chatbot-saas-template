/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * RBAC Utility Functions - Server Side
 * Centralized role management with type safety
 */

import { Role, Permission, ROLE_PERMISSIONS, ROLE_HIERARCHY, ROLE_DISPLAY_NAMES } from '../types/rbac';

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: Role | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

/**
 * Check if a user has admin privileges
 */
export function isAdmin(userRole: Role | undefined): boolean {
  return userRole === 'admin';
}

/**
 * Check if a user has pro or higher privileges
 */
export function isProUser(userRole: Role | undefined): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY.pro_user;
}

/**
 * Check if a user role is higher than or equal to required role
 */
export function hasRoleLevel(userRole: Role | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if user can access user management
 */
export function canManageUsers(userRole: Role | undefined): boolean {
  return hasPermission(userRole, 'user_management');
}

/**
 * Check if user can access system settings
 */
export function canAccessSystemSettings(userRole: Role | undefined): boolean {
  return hasPermission(userRole, 'system_settings');
}

/**
 * Check if user can view analytics
 */
export function canViewAnalytics(userRole: Role | undefined): boolean {
  return hasPermission(userRole, 'analytics_view');
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: Role): string {
  return ROLE_DISPLAY_NAMES[role];
}

/**
 * Validate role string and return typed Role or undefined
 */
export function validateRole(role: string | undefined): Role | undefined {
  if (!role) return undefined;
  const validRoles: Role[] = ['admin', 'pro_user', 'free_user'];
  return validRoles.includes(role as Role) ? (role as Role) : undefined;
}
