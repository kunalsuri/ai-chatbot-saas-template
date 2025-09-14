/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Components
export { default as Login } from './components/Login';
export { AuthProvider, useAuth as useAuthContext } from './components/AuthContext';

// Hooks
export { useAuth } from './hooks/useAuth';

// API
export { authApi } from './api/authApi';

// Utils
export {
  secureGet,
  securePost,
  securePut,
  secureDelete,
  secureApiCall,
  secureApiCallWithRetry,
  useApiErrorHandler,
  AuthenticationError,
  ServerRestartError,
} from './utils/secureApi';

export {
  hasPermission,
  isAdmin,
  isProUser,
  hasRoleLevel,
  getRolePermissions,
  canManageUsers,
  canAccessSystemSettings,
  canViewAnalytics,
  getRoleDisplayName,
  validateRole,
} from './utils/rbac';

// Types
export type {
  AuthUser,
  LoginCredentials,
  SignupCredentials,
  AuthState,
  AuthResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from './types';

// RBAC Types
export type {
  Role,
  Permission,
} from './types/rbac';

export {
  RoleSchema,
  PermissionSchema,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  ROLE_COLORS,
} from './types/rbac';
