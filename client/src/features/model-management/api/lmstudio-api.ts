/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { secureGet, securePost } from "@/features/auth/utils/secureApi";
import { LMStudioHealthCheck, OllamaTestResult } from '../types/api';

// Helper function to extract data from either response format
function extractResponseData<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
    return (response as any).data!;
  }
  if (response && typeof response === 'object' && !('success' in response)) {
    return response as T;
  }
  throw new Error('Invalid response format');
}

export const lmStudioApi = {
  checkHealth: async (enableLogging: boolean = false): Promise<LMStudioHealthCheck> => {
    const response = await secureGet(`/api/lmstudio/health?enableLogging=${enableLogging}`);
    return extractResponseData<LMStudioHealthCheck>(response);
  },

  getModels: async (enableLogging: boolean = false): Promise<{ models: string[] }> => {
    const response = await secureGet(`/api/lmstudio/models?enableLogging=${enableLogging}`);
    return extractResponseData<{ models: string[] }>(response);
  },

  testConnection: async (model: string): Promise<OllamaTestResult> => {
    const response = await securePost("/api/lmstudio/test", { model });
    return extractResponseData<OllamaTestResult>(response);
  },

  loadModel: async (model: string): Promise<{ success: boolean; message?: string }> => {
    const response = await securePost<{ success: boolean; message?: string }>("/api/lmstudio/load", { model });
    return response.data!;
  },

  unloadModel: async (model: string): Promise<{ success: boolean; message?: string }> => {
    const response = await securePost<{ success: boolean; message?: string }>("/api/lmstudio/unload", { model });
    return response.data!;
  },
};
