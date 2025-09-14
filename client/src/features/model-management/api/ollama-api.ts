/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { secureGet, securePost } from "@/features/auth/utils/secureApi";
import { OllamaHealthCheck, OllamaTestResult } from '../types/api';

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

export const ollamaApi = {
  checkHealth: async (enableLogging: boolean = false): Promise<OllamaHealthCheck> => {
    const response = await secureGet(`/api/ollama/health?enableLogging=${enableLogging}`);
    return extractResponseData<OllamaHealthCheck>(response);
  },

  getModels: async (enableLogging: boolean = false): Promise<{ models: string[] }> => {
    const response = await secureGet(`/api/ollama/models?enableLogging=${enableLogging}`);
    return extractResponseData<{ models: string[] }>(response);
  },

  testConnection: async (model: string): Promise<OllamaTestResult> => {
    const response = await securePost("/api/ollama/test", { model });
    return extractResponseData<OllamaTestResult>(response);
  },
};
