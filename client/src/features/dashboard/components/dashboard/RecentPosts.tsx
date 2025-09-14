/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Badge } from "@/shared/components/ui/badge";

export function RecentPosts() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/posts/recent"],
    queryFn: () => api.getRecentPosts(),
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2 p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Posts</h3>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border border-border/50">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      published: { variant: "default" as const, label: "Live", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      scheduled: { variant: "secondary" as const, label: "Scheduled", className: "bg-primary/10 text-primary" },
      draft: { variant: "outline" as const, label: "Draft", className: "bg-muted text-muted-foreground" },
    };
    
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return "Yesterday";
    return d.toLocaleDateString();
  };

  return (
    <Card className="lg:col-span-2 p-6 border border-border shadow-sm" data-testid="recent-posts">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Posts</h3>
        <Button variant="link" className="text-primary text-sm font-medium hover:text-primary/80" data-testid="button-view-all-posts">
          View all
        </Button>
      </div>

      <div className="space-y-4">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-image text-4xl text-muted-foreground/50 mb-4"></i>
            <p className="text-muted-foreground font-medium">No posts yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Create your first post to get started</p>
          </div>
        ) : (
          posts.slice(0, 3).map((post) => {
            const statusBadge = getStatusBadge(post.status);
            
            return (
              <div
                key={post.id}
                className="flex items-center space-x-4 p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                data-testid={`post-${post.id}`}
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                    <i className="fas fa-image text-muted-foreground/60"></i>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-foreground line-clamp-1" data-testid={`post-title-${post.id}`}>
                    {post.title}
                  </p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                    <span>{post.status}</span>
                    <span>{post.platform}</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs font-medium rounded-full ${statusBadge.className}`}>
                    {statusBadge.label}
                  </Badge>
                  <Button variant="ghost" size="sm" className="p-1 text-muted-foreground hover:text-foreground" data-testid={`button-edit-post-${post.id}`}>
                    <i className="fas fa-edit text-sm"></i>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
