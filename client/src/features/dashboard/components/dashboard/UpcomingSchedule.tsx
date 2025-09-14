/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useLocation } from "wouter";
import { Calendar, Image as ImageIcon, Instagram } from "lucide-react";

export function UpcomingSchedule() {
  const [, navigate] = useLocation();
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/posts/recent"],
    queryFn: () => api.getRecentPosts(),
  });

  const scheduledPosts = posts?.filter(post => post.status === "scheduled")?.slice(0, 4) || [];

  const formatScheduleDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "In a few minutes";
    if (diffHours < 24) return `In ${diffHours} hours`;
    if (diffHours < 48) return "Tomorrow";
    return d.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-primary",
      published: "bg-green-600",
      draft: "bg-orange-500",
    };
    return colors[status as keyof typeof colors] || "bg-muted-foreground";
  };

  if (isLoading) {
    return (
      <Card className="p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="w-2 h-2 rounded-full" />
              </div>
              <Skeleton className="w-full h-24 rounded-lg mb-3" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-border shadow-sm" data-testid="upcoming-schedule">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Schedule</h3>
        <Button
          variant="link"
          className="text-primary text-sm font-medium hover:text-primary/80"
          onClick={() => navigate("/calendar")}
          data-testid="button-view-full-calendar"
        >
          View calendar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scheduledPosts.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Calendar className="w-10 h-10 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">No scheduled posts</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Schedule posts to see them here</p>
          </div>
        ) : (
          scheduledPosts.map((post) => (
            <div
              key={post.id}
              className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
              data-testid={`scheduled-post-${post.id}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground/90">
                  {post.scheduledFor ? formatScheduleDate(post.scheduledFor) : "Not scheduled"}
                </span>
                <div className={`w-2 h-2 ${getStatusColor(post.status)} rounded-full`}></div>
              </div>
              
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-24 rounded-lg object-cover mb-3"
                />
              ) : (
                <div className="w-full h-24 rounded-lg bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-muted-foreground/60" />
                </div>
              )}
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3" data-testid={`scheduled-post-preview-${post.id}`}>
                {post.title}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span className="text-xs text-muted-foreground">{post.platform}</span>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-primary hover:text-primary/80 p-0"
                  data-testid={`button-edit-scheduled-post-${post.id}`}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
