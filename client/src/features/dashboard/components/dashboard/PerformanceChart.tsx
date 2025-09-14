/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useQuery } from "@tanstack/react-query";
import { LineChart } from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function PerformanceChart() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <Card className="p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-border shadow-sm" data-testid="performance-chart">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Performance This Week</h3>
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="text-muted-foreground">Engagement Rate</span>
        </div>
      </div>
      
      {/* Chart Placeholder */}
      <div className="h-48 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg flex items-center justify-center border border-border">
        <div className="text-center">
          <LineChart className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
          <p className="text-muted-foreground font-medium">Analytics Chart</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Performance data visualization</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground" data-testid="analytics-likes">
            {stats?.analytics.likes.toLocaleString() || "0"}
          </p>
          <p className="text-sm text-muted-foreground">Likes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground" data-testid="analytics-shares">
            {stats?.analytics.shares.toLocaleString() || "0"}
          </p>
          <p className="text-sm text-muted-foreground">Shares</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground" data-testid="analytics-comments">
            {stats?.analytics.comments.toLocaleString() || "0"}
          </p>
          <p className="text-sm text-muted-foreground">Comments</p>
        </div>
      </div>
    </Card>
  );
}
