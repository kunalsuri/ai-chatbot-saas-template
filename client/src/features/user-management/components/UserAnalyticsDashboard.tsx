/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Activity,
  Crown,
  Zap
} from 'lucide-react';
import { CompleteUser } from '../types/user-management';

interface UserAnalyticsDashboardProps {
  users: CompleteUser[];
  className?: string;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  usersByRole: Record<string, number>;
  usersByPlan: Record<string, number>;
  recentSignups: number;
  growthRate: number;
  retentionRate: number;
  averageSessionTime: number;
}

/**
 * Enhanced Analytics Dashboard for User Management
 * Provides comprehensive insights and metrics
 */
export function UserAnalyticsDashboard({ users, className }: UserAnalyticsDashboardProps) {
  const analytics = useMemo((): AnalyticsData => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const inactiveUsers = users.filter(u => u.status === 'inactive').length;
    const suspendedUsers = users.filter(u => u.status === 'suspended').length;
    const pendingUsers = users.filter(u => u.status === 'pending').length;

    // Recent signups (last 7 days)
    const recentSignups = users.filter(u => 
      new Date(u.createdAt) >= lastWeek
    ).length;

    // Growth rate calculation (simplified)
    const usersLastMonth = users.filter(u => 
      new Date(u.createdAt) <= lastMonth
    ).length;
    const growthRate = usersLastMonth > 0 
      ? ((totalUsers - usersLastMonth) / usersLastMonth) * 100 
      : 0;

    // User distribution by role
    const usersByRole = users.reduce((acc, user) => {
      const role = user.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // User distribution by plan
    const usersByPlan = users.reduce((acc, user) => {
      const plan = user.plan || 'free';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Retention rate (users who logged in within last 30 days)
    const activeInLastMonth = users.filter(u => 
      u.lastLogin && new Date(u.lastLogin) >= lastMonth
    ).length;
    const retentionRate = totalUsers > 0 ? (activeInLastMonth / totalUsers) * 100 : 0;

    // Mock average session time (in minutes)
    const averageSessionTime = 24; // This would come from actual analytics

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      pendingUsers,
      usersByRole,
      usersByPlan,
      recentSignups,
      growthRate,
      retentionRate,
      averageSessionTime,
    };
  }, [users]);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600',
      inactive: 'text-gray-600',
      suspended: 'text-red-600',
      pending: 'text-yellow-600',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getPlanColor = (plan: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-gold-100 text-gold-800',
    };
    return colors[plan as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.growthRate >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(analytics.growthRate).toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers}</div>
            <Progress 
              value={(analytics.activeUsers / analytics.totalUsers) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentSignups}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.retentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">30-day retention</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { status: 'active', count: analytics.activeUsers, icon: UserCheck },
              { status: 'inactive', count: analytics.inactiveUsers, icon: UserX },
              { status: 'suspended', count: analytics.suspendedUsers, icon: Shield },
              { status: 'pending', count: analytics.pendingUsers, icon: Calendar },
            ].map(({ status, count, icon: Icon }) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${getStatusColor(status)}`} />
                  <span className="capitalize font-medium">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {((count / analytics.totalUsers) * 100).toFixed(1)}%
                  </span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Plan Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.usersByPlan).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {plan === 'enterprise' && <Crown className="h-4 w-4 text-yellow-500" />}
                  {plan === 'premium' && <Zap className="h-4 w-4 text-purple-500" />}
                  {plan === 'pro' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                  {plan === 'free' && <Users className="h-4 w-4 text-gray-500" />}
                  <span className="capitalize font-medium">{plan}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {((count / analytics.totalUsers) * 100).toFixed(1)}%
                  </span>
                  <Badge className={getPlanColor(plan)}>{count}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analytics.usersByRole).map(([role, count]) => (
              <div key={role} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{role.replace('_', ' ')}</div>
                <Progress 
                  value={(count / analytics.totalUsers) * 100} 
                  className="mt-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageSessionTime}m</div>
            <p className="text-xs text-muted-foreground">Per user session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(((analytics.usersByPlan.pro || 0) + (analytics.usersByPlan.premium || 0) + (analytics.usersByPlan.enterprise || 0)) / analytics.totalUsers * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Free to paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {Math.max(0, analytics.inactiveUsers + analytics.suspendedUsers)}
            </div>
            <p className="text-xs text-muted-foreground">Users at risk</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}