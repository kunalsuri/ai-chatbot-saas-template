/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Components
export { default as Dashboard } from './components/Dashboard';
export { default as Landing } from './components/Landing';

// Hooks
export { useDashboard } from './hooks/useDashboard';

// API
export { dashboardApi } from './api/dashboardApi';

// Types
export type {
  DashboardStats,
  QuickAction,
  RecentActivity,
  SystemHealth,
  DashboardState,
} from './types';
