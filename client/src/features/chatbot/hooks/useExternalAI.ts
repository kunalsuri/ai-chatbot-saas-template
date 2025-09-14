/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useEffect, useCallback } from 'react';
import { ExternalProvider, ExternalAIHealthCheck } from '@/features/model-management/types';
import { secureGet, securePost } from "@/features/auth/utils/secureApi";
import { useToast } from "@/shared/hooks/use-toast";

interface ExternalAIState {
  google: {
    connected: boolean;
    models: string[];
    error?: string;
    latency?: number;
  };
  anthropic: {
    connected: boolean;
    models: string[];
    error?: string;
    latency?: number;
  };
  mistral: {
    connected: boolean;
    models: string[];
    error?: string;
    latency?: number;
  };
  openai: {
    connected: boolean;
    models: string[];
    error?: string;
    latency?: number;
  };
}

interface UseExternalAIReturn {
  providers: ExternalAIState;
  isLoading: boolean;
  refreshHealth: () => Promise<void>;
  generateResponse: (
    provider: ExternalProvider,
    message: string,
    context?: Array<{ role: 'user' | 'assistant'; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) => Promise<{
    response: string;
    model: string;
    provider: ExternalProvider;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;
}

export function useExternalAI(): UseExternalAIReturn {
  const { toast } = useToast();
  const [providers, setProviders] = useState<ExternalAIState>({
    google: { connected: false, models: [] },
    anthropic: { connected: false, models: [] },
    mistral: { connected: false, models: [] },
    openai: { connected: false, models: [] },
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await secureGet('/api/external-ai/health');
      const healthData = response.data as Record<ExternalProvider, ExternalAIHealthCheck>;

      const newProviders: ExternalAIState = {
        google: {
          connected: healthData.google?.connected || false,
          models: healthData.google?.models?.map(m => m.id) || [],
          error: healthData.google?.error,
          latency: healthData.google?.latency,
        },
        anthropic: {
          connected: healthData.anthropic?.connected || false,
          models: healthData.anthropic?.models?.map(m => m.id) || [],
          error: healthData.anthropic?.error,
          latency: healthData.anthropic?.latency,
        },
        mistral: {
          connected: healthData.mistral?.connected || false,
          models: healthData.mistral?.models?.map(m => m.id) || [],
          error: healthData.mistral?.error,
          latency: healthData.mistral?.latency,
        },
        openai: {
          connected: healthData.openai?.connected || false,
          models: healthData.openai?.models?.map(m => m.id) || [],
          error: healthData.openai?.error,
          latency: healthData.openai?.latency,
        },
      };

      setProviders(newProviders);
    } catch (error) {
      console.error('Failed to refresh external AI health:', error);
      toast({
        title: "Health Check Failed",
        description: "Failed to check external AI provider status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateResponse = useCallback(async (
    provider: ExternalProvider,
    message: string,
    context: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) => {
    try {
      const response = await securePost('/api/external-ai/message', {
        message,
        provider,
        context,
        ...options
      });

      return response.data;
    } catch (error) {
      console.error(`Failed to generate response from ${provider}:`, error);
      throw error;
    }
  }, []);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  return {
    providers,
    isLoading,
    refreshHealth,
    generateResponse,
  };
}
