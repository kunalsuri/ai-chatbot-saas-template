/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

export interface DashboardStats {
  totalChats: number;
  totalTokens: number;
  activeModels: number;
  uptime: string;
  lastActivity: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  category: 'summary' | 'translation' | 'chatbot' | 'management' | 'settings';
}

export interface RecentActivity {
  id: string;
  type: 'chat' | 'summary' | 'translation' | 'prompt-improvement';
  title: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  providers: {
    ollama: 'online' | 'offline' | 'error';
    lmstudio: 'online' | 'offline' | 'error';
    external: 'online' | 'offline' | 'error';
  };
  lastChecked: string;
}

export interface DashboardState {
  stats: DashboardStats;
  quickActions: QuickAction[];
  recentActivity: RecentActivity[];
  systemHealth: SystemHealth;
  isLoading: boolean;
  error: string | null;
}
