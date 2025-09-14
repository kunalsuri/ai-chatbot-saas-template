/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalProvider, ExternalAIModel, ExternalAIHealthCheck } from '../types';
import { ApiResponse } from '@shared/types/api';

interface ProviderData {
  provider: ExternalProvider;
  isConfigured: boolean;
  models: ExternalAIModel[];
  defaultModel: string;
  health: ExternalAIHealthCheck;
}

interface ModelTestRequest {
  provider: ExternalProvider;
  model: string;
  message: string;
}

interface ModelTestResult {
  result: {
    content: string;
    model: string;
    provider: ExternalProvider;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  responseTime: number;
}

export function useExternalModelManagement() {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<ExternalProvider | null>(null);
  const [testMessage, setTestMessage] = useState('Hello, how are you?');

  // Fetch all providers and their data
  const {
    data: providersData,
    isLoading: isLoadingProviders,
    error: providersError,
    refetch: refetchProviders
  } = useQuery<ApiResponse<ProviderData[]>>({
    queryKey: ['external-model-mgmt', 'providers'],
    queryFn: async () => {
      const response = await fetch('/api/external-model-mgmt/providers');
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch models for a specific provider
  const {
    data: modelsData,
    isLoading: isLoadingModels,
    error: modelsError,
    refetch: refetchModels
  } = useQuery<ApiResponse<ExternalAIModel[]>>({
    queryKey: ['external-model-mgmt', 'models', selectedProvider],
    queryFn: async () => {
      if (!selectedProvider) return null;
      const response = await fetch(`/api/external-model-mgmt/providers/${selectedProvider}/models`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models for ${selectedProvider}`);
      }
      return response.json();
    },
    enabled: !!selectedProvider,
  });

  // Test model mutation
  const testModelMutation = useMutation<ApiResponse<ModelTestResult>, Error, ModelTestRequest>({
    mutationFn: async ({ provider, model, message }) => {
      const response = await fetch(`/api/external-model-mgmt/providers/${provider}/models/${model}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test model');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Optionally refresh provider health after successful test
      queryClient.invalidateQueries({ queryKey: ['external-model-mgmt', 'providers'] });
    },
  });

  // Health check mutation
  const healthCheckMutation = useMutation<ApiResponse<ExternalAIHealthCheck>, Error, ExternalProvider>({
    mutationFn: async (provider) => {
      const response = await fetch(`/api/external-model-mgmt/providers/${provider}/health`);
      if (!response.ok) {
        throw new Error(`Failed to check health for ${provider}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-model-mgmt', 'providers'] });
    },
  });

  // Helper functions
  const getConfiguredProviders = () => {
    return providersData?.data?.filter(p => p.isConfigured) || [];
  };

  const getUnconfiguredProviders = () => {
    return providersData?.data?.filter(p => !p.isConfigured) || [];
  };

  const getProviderHealth = (provider: ExternalProvider) => {
    return providersData?.data?.find(p => p.provider === provider)?.health;
  };

  const getProviderModels = (provider: ExternalProvider) => {
    return providersData?.data?.find(p => p.provider === provider)?.models || [];
  };

  const testModel = (provider: ExternalProvider, model: string, message?: string) => {
    return testModelMutation.mutate({
      provider,
      model,
      message: message || testMessage,
    });
  };

  const checkProviderHealth = (provider: ExternalProvider) => {
    return healthCheckMutation.mutate(provider);
  };

  // Auto-select first configured provider
  useEffect(() => {
    if (!selectedProvider && providersData?.data) {
      const firstConfigured = providersData.data.find(p => p.isConfigured);
      if (firstConfigured) {
        setSelectedProvider(firstConfigured.provider);
      }
    }
  }, [providersData, selectedProvider]);

  return {
    // Data
    providers: providersData?.data || [],
    models: modelsData?.data || [],
    selectedProvider,
    testMessage,
    
    // Loading states
    isLoadingProviders,
    isLoadingModels,
    isTestingModel: testModelMutation.isPending,
    isCheckingHealth: healthCheckMutation.isPending,
    
    // Error states
    providersError,
    modelsError,
    testError: testModelMutation.error,
    healthError: healthCheckMutation.error,
    
    // Test results
    testResult: testModelMutation.data,
    healthResult: healthCheckMutation.data,
    
    // Actions
    setSelectedProvider,
    setTestMessage,
    testModel,
    checkProviderHealth,
    refetchProviders,
    refetchModels,
    
    // Helper functions
    getConfiguredProviders,
    getUnconfiguredProviders,
    getProviderHealth,
    getProviderModels,
    
    // Reset functions
    resetTestResult: () => testModelMutation.reset(),
    resetHealthResult: () => healthCheckMutation.reset(),
  };
}
