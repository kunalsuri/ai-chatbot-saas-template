/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 * 
 * Consolidated Dashboard API - combines methods from monolithic api.ts and existing dashboardApi.ts
 */

import { secureGet } from "@/features/auth/utils/secureApi";
import type { DashboardStats, Post } from "@/types";
import { 
  QuickAction, 
  RecentActivity, 
  SystemHealth 
} from '../types';

export const dashboardApi = {
  // From monolithic api.ts
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await secureGet<DashboardStats>("/api/dashboard/stats");
    return response.data!;
  },

  getRecentPosts: async (): Promise<Post[]> => {
    const response = await secureGet<Post[]>("/api/posts/recent");
    return response.data!;
  },

  // Existing dashboard-specific methods
  getQuickActions: async (): Promise<QuickAction[]> => {
    const response = await secureGet<QuickAction[]>("/api/dashboard/quick-actions");
    return response.data!;
  },

  getRecentActivity: async (limit = 10): Promise<RecentActivity[]> => {
    const response = await secureGet<RecentActivity[]>(`/api/dashboard/recent-activity?limit=${limit}`);
    return response.data!;
  },

  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await secureGet<SystemHealth>("/api/dashboard/system-health");
    return response.data!;
  },

  refreshStats: async (): Promise<DashboardStats> => {
    const response = await secureGet<DashboardStats>("/api/dashboard/stats/refresh");
    return response.data!;
  },
};
