/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { secureGet } from "@/features/auth";
import type { ImageSearchResponse } from "@/types";

export const imagesApi = {
  searchImages: async (params: {
    q: string;
    page?: number;
    per_page?: number;
    orientation?: "landscape" | "portrait" | "square";
    category?: string;
  }): Promise<ImageSearchResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await secureGet<ImageSearchResponse>(`/api/images/search?${searchParams}`);
    return response.data!;
  },

  getCuratedImages: async (page: number = 1, per_page: number = 20): Promise<ImageSearchResponse> => {
    const response = await secureGet<ImageSearchResponse>(`/api/images/curated?page=${page}&per_page=${per_page}`);
    return response.data!;
  },

  searchPixabayImages: async (params: {
    q: string;
    page?: number;
    per_page?: number;
    orientation?: "all" | "horizontal" | "vertical";
    category?: string;
    colors?: string;
    order?: "popular" | "latest";
  }): Promise<ImageSearchResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await secureGet<ImageSearchResponse>(`/api/images/pixabay/search?${searchParams}`);
    return response.data!;
  },

  getImageCategories: async (): Promise<{ pexels: { name: string; queries: string[] }[]; pixabay: string[] }> => {
    const response = await secureGet<{ pexels: { name: string; queries: string[] }[]; pixabay: string[] }>("/api/images/categories");
    return response.data!;
  },
};
