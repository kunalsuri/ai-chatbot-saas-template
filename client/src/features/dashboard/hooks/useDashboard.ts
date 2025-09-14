/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { DashboardState } from '../types';

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    stats: {
      totalChats: 0,
      totalTokens: 0,
      activeModels: 0,
      uptime: '0h 0m',
      lastActivity: 'Never',
    },
    quickActions: [],
    recentActivity: [],
    systemHealth: {
      status: 'healthy',
      providers: {
        ollama: 'offline',
        lmstudio: 'offline',
        external: 'offline',
      },
      lastChecked: new Date().toISOString(),
    },
    isLoading: true,
    error: null,
  });

  const loadDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const [stats, quickActions, recentActivity, systemHealth] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getQuickActions(),
        dashboardApi.getRecentActivity(),
        dashboardApi.getSystemHealth(),
      ]);

      setState(prev => ({
        ...prev,
        stats,
        quickActions,
        recentActivity,
        systemHealth,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
      }));
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const stats = await dashboardApi.refreshStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh stats',
      }));
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    ...state,
    loadDashboardData,
    refreshStats,
  };
}
