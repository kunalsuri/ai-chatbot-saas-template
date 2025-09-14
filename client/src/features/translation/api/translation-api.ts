/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { secureGet, securePost, secureDelete } from "@/features/auth/utils/secureApi";
import { TranslationHistoryItem } from '../types';

export const translationApi = {
  getHistory: async (): Promise<TranslationHistoryItem[]> => {
    const response = await secureGet<TranslationHistoryItem[]>("/api/translate/history");
    return response.data!;
  },

  getById: async (id: string): Promise<TranslationHistoryItem> => {
    const response = await secureGet<TranslationHistoryItem>(`/api/translate/history/${id}`);
    return response.data!;
  },

  save: async (translation: Omit<TranslationHistoryItem, 'id' | 'timestamp'>): Promise<TranslationHistoryItem> => {
    const response = await securePost<TranslationHistoryItem>("/api/translate/history", translation);
    return response.data!;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await secureDelete<{ success: boolean }>(`/api/translate/history/${id}`);
    return response.data!;
  },
};