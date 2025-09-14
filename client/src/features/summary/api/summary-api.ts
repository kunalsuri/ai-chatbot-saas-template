/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { secureGet, securePost, secureDelete } from "@/features/auth/utils/secureApi";
import { SummaryHistoryItem } from '../types';

export const summaryApi = {
  getHistory: async (): Promise<SummaryHistoryItem[]> => {
    const response = await secureGet<SummaryHistoryItem[]>('/api/summary/history');
    return response.data!;
  },

  getById: async (id: string): Promise<SummaryHistoryItem> => {
    const response = await secureGet<SummaryHistoryItem>(`/api/summary/history/${id}`);
    return response.data!;
  },

  save: async (data: Omit<SummaryHistoryItem, 'id' | 'timestamp'>): Promise<SummaryHistoryItem> => {
    const response = await securePost<SummaryHistoryItem>('/api/summary/history', data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to save summary');
    }
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await secureDelete<{ success: boolean }>(`/api/summary/history/${id}`);
    return response.data!;
  },

  generate: async (params: {
    prompt: string;
    content: string;
    model: string;
    provider: 'ollama' | 'lmstudio';
  }): Promise<{ summary: string; tokens: number }> => {
    const response = await securePost<{ summary: string; tokens: number }>('/api/summary/generate', params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate summary');
    }
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  },
};