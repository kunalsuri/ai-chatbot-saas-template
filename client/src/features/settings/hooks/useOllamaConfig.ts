/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/shared/hooks/use-toast';

export interface OllamaConfig {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  timeout: number;
  baseUrl: string;
  healthCheckEnabled: boolean;
}

export interface OllamaConnectionStatus {
  connected: boolean;
  isOnline: boolean;
  error?: string;
  latency?: number;
  testing?: boolean;
  lastChecked?: Date;
  retryCount?: number;
  lastRetry?: Date;
}

const DEFAULT_CONFIG: OllamaConfig = {
  model: "llama3.2:latest",
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 200,
  timeout: 15000, // Increased timeout for better reliability
  baseUrl: "http://localhost:11434",
  healthCheckEnabled: true, // Default to ON for Ollama (always enabled)
};

const STORAGE_KEY = 'ollama-config';

export const useOllamaConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Load config from localStorage or use defaults
  const [config, setConfig] = useState<OllamaConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [connectionStatus, setConnectionStatus] = useState<OllamaConnectionStatus>({ 
    connected: false, 
    isOnline: false,
    testing: false,
    retryCount: 0
  });

  // Persist config changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save Ollama config to localStorage:', error);
    }
  }, [config]);

  // Health check query with auto-connect on mount and improved retry logic
  const { data: healthStatus, isLoading: healthLoading, refetch: refetchHealth, error: healthError } = useQuery({
    queryKey: ["/api/ollama/health"],
    queryFn: () => api.checkOllamaHealth(config.healthCheckEnabled),
    refetchInterval: 15000, // Check every 15 seconds for better responsiveness
    refetchOnWindowFocus: true,
    retry: 3, // Increased retries
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    staleTime: 5000, // Consider data stale after 5 seconds
    refetchIntervalInBackground: true, // Continue checking in background
  });
  
  // Handle health check errors
  useEffect(() => {
    if (healthError) {
      console.error("Ollama health check failed:", healthError);
      setConnectionStatus(prev => ({
        ...prev,
        connected: false,
        isOnline: false,
        error: healthError instanceof Error ? healthError.message : 'Server not responding',
        lastChecked: new Date(),
        retryCount: (prev.retryCount || 0) + 1,
        lastRetry: new Date()
      }));
    }
  }, [healthError]);

  // Models query
  const { 
    data: availableModels, 
    isLoading: modelsLoading, 
    error: modelsError,
    refetch: refetchModels 
  } = useQuery({
    queryKey: ["/api/ollama/models"],
    queryFn: () => api.getOllamaModels(config.healthCheckEnabled),
    enabled: healthStatus?.connected || false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Update connection status based on health check with more detailed status
  useEffect(() => {
    if (healthStatus) {
      const latency = healthStatus.latency || 0;
      setConnectionStatus(prev => {
        const newStatus = {
          ...prev,
          connected: healthStatus.connected,
          isOnline: healthStatus.isOnline,
          error: healthStatus.isOnline ? undefined : healthStatus.error || 'Server not responding',
          latency,
          lastChecked: new Date(),
          testing: false,
          // Reset retry count if connection is successful
          retryCount: healthStatus.isOnline ? 0 : (prev.retryCount || 0)
        };

        return newStatus;
      });

      // If we have models but aren't connected, try to reconnect
      if (healthStatus.models && healthStatus.models.length > 0 && !healthStatus.connected) {
        // Auto-retry with first available model
        const modelToTry = healthStatus.models[0];
        const currentRetryCount = connectionStatus.retryCount || 0;
        
        if (modelToTry && currentRetryCount < 3) {
          setTimeout(() => {
            testConnection(modelToTry).catch(console.error);
          }, 2000); // Delay retry to avoid overwhelming the server
        }
      }
    }
  }, [healthStatus]);

  // Auto-connect on mount - check connection immediately
  useEffect(() => {
    setConnectionStatus(prev => ({ ...prev, testing: true }));
  }, []);

  // Auto-select first available model if current model is not available
  useEffect(() => {
    if (availableModels?.models?.length && !availableModels.models.includes(config.model)) {
      const firstModel = availableModels.models[0];
      updateConfig({ model: firstModel });
      toast({
        title: "Model Auto-Selected",
        description: `Selected ${firstModel} as it's available locally.`,
      });
    }
  }, [availableModels, config.model]);

  const updateConfig = useCallback((updates: Partial<OllamaConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    toast({
      title: "Settings Reset",
      description: "Ollama configuration reset to default values.",
    });
  }, [toast]);

  const testConnection = useCallback(async (modelToTest?: string) => {
    const testModel = modelToTest || config.model;
    
    if (!testModel) {
      toast({
        title: "No Model Selected",
        description: "Please select a model before testing connection.",
        variant: "destructive",
      });
      return false;
    }

    setConnectionStatus(prev => ({ ...prev, testing: true }));
    const startTime = Date.now();

    try {
      const result = await api.testOllamaConnection(testModel);
      const latency = Date.now() - startTime;
      
      const newStatus: OllamaConnectionStatus = {
        connected: result.connected,
        isOnline: true, // If we got a response, the server is online
        error: result.error,
        latency,
        testing: false,
        lastChecked: new Date(),
        retryCount: 0 // Reset retry count on successful test
      };
      
      setConnectionStatus(newStatus);

      if (result.connected) {
        toast({
          title: "Connection Successful",
          description: `Connected to Ollama with ${testModel} (${latency}ms)`,
        });
        return true;
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Unable to connect to Ollama server",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      const newStatus: OllamaConnectionStatus = {
        connected: false,
        isOnline: false, // If we got an error, the server might be offline
        error: error instanceof Error ? error.message : 'Connection test failed',
        latency,
        testing: false,
        lastChecked: new Date(),
        retryCount: (connectionStatus.retryCount || 0) + 1,
        lastRetry: new Date()
      };
      
      setConnectionStatus(newStatus);

      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to test connection",
        variant: "destructive",
      });
      return false;
    }
  }, [config.model, toast]);

  // Refresh all data with retry mechanism
  const refreshAll = useCallback(async () => {
    setConnectionStatus(prev => ({
      ...prev,
      testing: true,
      retryCount: 0, // Reset retry count on manual refresh
      lastRetry: new Date()
    }));

    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/ollama/health"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/ollama/models"] })
      ]);

      // After refreshing, check if we need to retry connection
      const currentModels = availableModels?.models || [];
      setTimeout(() => {
        if (!connectionStatus.connected && currentModels.length > 0) {
          testConnection(currentModels[0]).catch(console.error);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to refresh Ollama data:", error);
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh Ollama status",
        variant: "destructive",
      });
    } finally {
      setConnectionStatus(prev => ({ ...prev, testing: false }));
    }
  }, [queryClient, connectionStatus.connected, availableModels, testConnection, toast]);
  
  // Manual retry connection function
  const retryConnection = useCallback(async () => {
    setConnectionStatus(prev => ({
      ...prev,
      testing: true,
      retryCount: (prev.retryCount || 0) + 1,
      lastRetry: new Date()
    }));

    // First refresh health status
    await refetchHealth();
    
    // Then try to connect if we have models
    const currentModels = availableModels?.models || [];
    if (currentModels.length > 0) {
      await testConnection(currentModels[0]);
    } else {
      // If no models, just refresh everything
      await refreshAll();
    }
  }, [refetchHealth, availableModels, testConnection, refreshAll]);

  const isValidConfig = useCallback(() => {
    return !!(
      config.model &&
      config.baseUrl &&
      config.temperature >= 0 && config.temperature <= 1 &&
      config.topP >= 0 && config.topP <= 1 &&
      config.maxTokens > 0 &&
      config.timeout > 0
    );
  }, [config]);

  return {
    // Configuration
    config,
    updateConfig,
    resetConfig,
    isValidConfig: isValidConfig(),
    
    // Connection
    connectionStatus,
    testConnection,
    refreshAll,
    retryConnection,
    
    // Models
    availableModels: availableModels?.models || [],
    modelsLoading,
    modelsError,
    refetchModels,
    
    // Health
    healthLoading,
    isConnected: connectionStatus.connected,
    isOnline: connectionStatus.isOnline,
    
    // Utilities
    getModelDisplayName: (model: string) => model.replace(':latest', ''),
    getModelBadge: (model: string) => {
      if (model.includes('llama3.2')) return 'Latest';
      if (model.includes('mistral')) return 'Fast';
      return 'Local';
    }
  };
};

export default useOllamaConfig;
