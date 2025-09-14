/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { Users, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { CompleteUser } from '@/features/user-management';

interface UserStatsProps {
  users: CompleteUser[];
  totalUsers: number;
}

export function UserStats({ users, totalUsers }: UserStatsProps) {
  const activeUsers = users.filter(user => user.status === 'active').length;
  const freeUsers = users.filter(user => user.plan === 'free').length;
  const proUsers = users.filter(user => user.plan === 'pro').length;
  const premiumUsers = users.filter(user => user.plan === 'premium').length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            +{Math.floor(Math.random() * 10)}% from last month
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{activeUsers}</div>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <Progress 
            value={(activeUsers / totalUsers) * 100} 
            className="mt-2" 
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">User Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <div className="text-xs">Free: {freeUsers}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="text-xs">Pro: {proUsers}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <div className="text-xs">Premium: {premiumUsers}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
