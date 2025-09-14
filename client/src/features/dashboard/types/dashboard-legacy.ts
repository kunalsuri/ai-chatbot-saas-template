/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Dashboard-specific types moved from shared/types
export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  status: "draft" | "scheduled" | "published";
  platform: string;
  scheduledFor?: Date;
  publishedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  isPublic: boolean;
  usageCount?: number;
  createdAt: Date;
}

export interface Analytics {
  id: string;
  postId: string;
  platform: string;
  likes: number;
  shares: number;
  comments: number;
  views: number;
  engagementRate: number;
  recordedAt: Date;
}

export interface DashboardStats {
  totalPosts: number;
  scheduled: number;
  engagement: string;
  templates: number;
  analytics: {
    likes: number;
    shares: number;
    comments: number;
  };
}
