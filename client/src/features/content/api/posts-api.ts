/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { securePost } from "@/features/auth";
import type { Post } from "@/types";

export const postsApi = {
  createPost: async (postData: Partial<Post>): Promise<Post> => {
    const response = await securePost<Post>("/api/posts", postData);
    return response.data!;
  },

  schedulePost: async (postId: string, scheduledFor: Date): Promise<Post> => {
    const response = await securePost<Post>("/api/posts/schedule", {
      postId,
      scheduledFor: scheduledFor.toISOString(),
    });
    return response.data!;
  },

  publishPost: async (postId: string, platform: string = "instagram"): Promise<{ post: Post; publishResult: { success: boolean; message?: string } }> => {
    const response = await securePost<{ post: Post; publishResult: { success: boolean; message?: string } }>("/api/posts/publish", {
      postId,
      platform,
    });
    return response.data!;
  },
};
