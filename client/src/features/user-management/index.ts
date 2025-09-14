/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Components
export { default as UserManagement } from './components/UserManagement';
export { UserAnalyticsDashboard } from './components/UserAnalyticsDashboard';
export { EnhancedUserFilters } from './components/EnhancedUserFilters';
export { UserManagementErrorBoundary } from './components/ErrorBoundary';

// Hooks
export { 
  useCurrentUser, 
  useUserList, 
  useUser, 
  useUserSearch, 
  useUserAnalytics, 
  useUserPreferences, 
  useUserAvatar, 
  useUserActivity 
} from './hooks/useUserManagement';

export { useDebounce, useDebouncedSearch } from './hooks/useDebounce';
export { useVirtualizedList } from './hooks/useVirtualizedList';
export { useWebSocket, useUserManagementWebSocket } from './hooks/useWebSocket';
export { useFuzzySearch, useSavedSearches } from './hooks/useFuzzySearch';

// API
export { userApi } from './api/userApi';

// Utilities
export * from './utils/dataExport';

// Types
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserManagementState,
} from './types';

// User Management Types
export type {
  UserCore,
  UserAuth,
  UserProfile,
  UserSubscription,
  UserPreferences,
  UserAnalytics,
  CompleteUser,
  PublicUser,
  SessionUser,
  CreateUser,
  UpdateUserProfile,
  UpdateUserPreferences,
  UserQuery,
  UserListResponse,
} from './types/user-management';
