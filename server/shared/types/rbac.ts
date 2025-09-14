/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * Role-Based Access Control (RBAC) Types - Server Side
 * Centralized role management with type safety
 */

import { z } from 'zod';

// Role definitions
export const RoleSchema = z.union([z.literal('admin'), z.literal('pro_user'), z.literal('free_user')]);
export type Role = z.infer<typeof RoleSchema>;

// Permission definitions
export const PermissionSchema = z.union([
  z.literal('user_management'),
  z.literal('system_settings'),
  z.literal('analytics_view'),
  z.literal('premium_features'),
  z.literal('api_access'),
  z.literal('export_data'),
  z.literal('billing_management'),
]);
export type Permission = z.infer<typeof PermissionSchema>;

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'user_management',
    'system_settings',
    'analytics_view',
    'premium_features',
    'api_access',
    'export_data',
    'billing_management',
  ],
  pro_user: [
    'premium_features',
    'api_access',
    'export_data',
  ],
  free_user: [],
} as const;

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<Role, number> = {
  free_user: 0,
  pro_user: 1,
  admin: 2,
} as const;

// Role display names
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  admin: 'Administrator',
  pro_user: 'Pro User',
  free_user: 'Free User',
} as const;
