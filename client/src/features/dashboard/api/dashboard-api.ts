/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { secureGet } from "@/features/auth";
import type { DashboardStats, Post } from "@/types";

export const dashboardApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await secureGet<DashboardStats>("/api/dashboard/stats");
    return response.data!;
  },

  getRecentPosts: async (): Promise<Post[]> => {
    const response = await secureGet<Post[]>("/api/posts/recent");
    return response.data!;
  },
};
