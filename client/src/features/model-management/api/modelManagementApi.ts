/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 * 
 * General Model Management API - provider-agnostic model management methods
 */

import { secureGet, securePost, secureDelete } from "@/features/auth/utils/secureApi";
import { 
  ModelProvider, 
  AIModel, 
  ModelTestRequest, 
  ModelTestResponse,
  ModelDownloadProgress 
} from '../types';

export const modelManagementApi = {
  getProviders: async (): Promise<ModelProvider[]> => {
    const response = await secureGet<ModelProvider[]>("/api/model-management/providers");
    return response.data!;
  },

  getProviderModels: async (providerId: string): Promise<AIModel[]> => {
    const response = await secureGet<AIModel[]>(`/api/model-management/providers/${providerId}/models`);
    return response.data!;
  },

  testModel: async (request: ModelTestRequest): Promise<ModelTestResponse> => {
    const response = await securePost<ModelTestResponse>("/api/model-management/test", request);
    return response.data!;
  },

  downloadModel: async (providerId: string, modelId: string): Promise<void> => {
    await securePost(`/api/model-management/providers/${providerId}/models/${modelId}/download`, {});
  },

  deleteModel: async (providerId: string, modelId: string): Promise<void> => {
    await secureDelete(`/api/model-management/providers/${providerId}/models/${modelId}`);
  },

  getDownloadProgress: async (modelId: string): Promise<ModelDownloadProgress> => {
    const response = await secureGet<ModelDownloadProgress>(`/api/model-management/download-progress/${modelId}`);
    return response.data!;
  },

  refreshProviders: async (): Promise<ModelProvider[]> => {
    const response = await securePost<ModelProvider[]>("/api/model-management/providers/refresh", {});
    return response.data!;
  },

  checkProviderHealth: async (providerId: string): Promise<boolean> => {
    const response = await secureGet<{ healthy: boolean }>(`/api/model-management/providers/${providerId}/health`);
    return response.data!.healthy;
  },
};
