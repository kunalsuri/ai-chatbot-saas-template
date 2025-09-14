/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

export interface User {
  id: string;
  username: string;
  email: string;
  plan: string;
  createdAt: Date;
}

export interface Quote {
  id: string;
  userId: string;
  text: string;
  author?: string;
  category?: string;
  createdAt: Date;
}

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

export interface PexelsImage {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface ImageSearchResponse {
  page: number;
  per_page: number;
  photos: PexelsImage[];
  total_results: number;
  next_page?: string;
  prev_page?: string;
}

export interface GeneratedCaption {
  caption: string;
  hashtags: string[];
}
