/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { secureGet, securePost, secureDelete } from "@/features/auth/utils/secureApi";

export interface PromptImprovementHistoryItem {
  id: string;
  original: string;
  improved: string;
  model: string;
  provider: string;
  tokens: number;
  timestamp: string;
  userId: string;
}

export const promptImproverApi = {
  getHistory: async (): Promise<PromptImprovementHistoryItem[]> => {
    const response = await secureGet<PromptImprovementHistoryItem[]>('/api/prompt-improver/history');
    return response.data!;
  },

  getById: async (id: string): Promise<PromptImprovementHistoryItem> => {
    const response = await secureGet<PromptImprovementHistoryItem>(`/api/prompt-improver/history/${id}`);
    return response.data!;
  },

  save: async (data: Omit<PromptImprovementHistoryItem, 'id' | 'timestamp'>): Promise<PromptImprovementHistoryItem> => {
    const response = await securePost<PromptImprovementHistoryItem>('/api/prompt-improver/history', data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to save prompt improvement');
    }
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await secureDelete<{ success: boolean }>(`/api/prompt-improver/history/${id}`);
    return response.data!;
  },

  improve: async (params: {
    prompt: string;
    model: string;
    outputMode?: 'text' | 'markdown';
  }): Promise<{ improved: string; tokens: number }> => {
    const response = await securePost<{
      originalPrompt: string;
      improvedPrompt: string;
      metadata: { model: string; style: string };
    }>('/api/prompt-improver/improve', params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to improve prompt');
    }
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    // Transform server response to expected format
    return {
      improved: response.data.improvedPrompt,
      tokens: Math.ceil(response.data.improvedPrompt.length / 4) // Rough token estimate
    };
  },
};