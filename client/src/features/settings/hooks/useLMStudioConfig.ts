/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/shared/hooks/use-toast';

export interface LMStudioConfig {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  timeout: number;
  baseUrl: string;
  healthCheckEnabled: boolean;
}

export interface LMStudioModel {
  id: string;
  name: string;
  state: 'loaded' | 'not-loaded';
  type: string;
  quantization?: string;
  maxContext?: number | null;
  publisher: string;
}

export interface LMStudioConnectionStatus {
  connected: boolean;
  isOnline: boolean;
  error?: string;
  latency?: number;
  testing?: boolean;
  lastChecked?: Date;
  retryCount?: number;
  lastRetry?: Date;
}

const DEFAULT_CONFIG: LMStudioConfig = {
  model: "",
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 200,
  timeout: 15000, // Increased timeout for better reliability
  baseUrl: "http://localhost:1234",
  healthCheckEnabled: false, // Default to OFF for health checks
};

const STORAGE_KEY = 'lmstudio-config';

export const useLMStudioConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Load config from localStorage or use defaults
  const [config, setConfig] = useState<LMStudioConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [connectionStatus, setConnectionStatus] = useState<LMStudioConnectionStatus>({ 
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
      console.warn('Failed to save LM Studio config to localStorage:', error);
    }
  }, [config]);

  // Health check query with auto-connect on mount and improved retry logic
  const { data: healthStatus, isLoading: healthLoading, refetch: refetchHealth, error: healthError } = useQuery({
    queryKey: ["/api/lmstudio/health"],
    queryFn: () => api.checkLMStudioHealth(config.healthCheckEnabled),
    refetchInterval: config.healthCheckEnabled ? 15000 : false, // Only run periodic checks if enabled
    refetchOnWindowFocus: config.healthCheckEnabled, // Only check on window focus if enabled
    retry: config.healthCheckEnabled ? 3 : 0, // Only retry if health checks are enabled
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    staleTime: 5000,
    refetchIntervalInBackground: config.healthCheckEnabled, // Only run background checks if enabled
    enabled: config.healthCheckEnabled, // Only run the query if health checks are enabled
  });
  
  // Handle health check errors
  useEffect(() => {
    if (healthError) {
      console.error("LM Studio health check failed:", healthError);
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
    data: modelsData, 
    isLoading: modelsLoading, 
    error: modelsError,
    refetch: refetchModels 
  } = useQuery({
    queryKey: ["/api/lmstudio/models"],
    queryFn: () => api.getLMStudioModels(config.healthCheckEnabled),
    enabled: healthStatus?.isOnline || false,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Get available models
  const availableModels: string[] = modelsData?.models || [];

  // Test connection function - moved up to fix reference before declaration
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
      const result = await api.testLMStudioConnection(testModel);
      const latency = Date.now() - startTime;
      
      const newStatus: LMStudioConnectionStatus = {
        connected: result.connected,
        isOnline: result.connected, // Set isOnline based on connection result
        error: result.error,
        latency,
        testing: false,
        lastChecked: new Date(),
        retryCount: result.connected ? 0 : (connectionStatus.retryCount || 0) + 1
      };
      
      setConnectionStatus(newStatus);

      if (result.connected) {
        toast({
          title: "Connection Successful",
          description: `Connected to LM Studio with ${testModel} (${latency}ms)`,
        });
        return true;
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Unable to connect to LM Studio server",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      const newStatus: LMStudioConnectionStatus = {
        connected: false,
        isOnline: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
        latency,
        testing: false,
        lastChecked: new Date(),
        retryCount: (connectionStatus.retryCount || 0) + 1
      };
      
      setConnectionStatus(newStatus);

      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to test connection",
        variant: "destructive",
      });
      return false;
    }
  }, [config.model, toast, connectionStatus.retryCount]);

  // Update connection status based on health check with more detailed status
  useEffect(() => {
    if (healthStatus) {
      setConnectionStatus(prev => {
        const newStatus = {
          ...prev,
          connected: healthStatus.connected,
          isOnline: healthStatus.isOnline,
          error: healthStatus.isOnline ? undefined : healthStatus.error || 'Server not responding',
          lastChecked: new Date(),
          testing: false,
          // Reset retry count if connection is successful
          retryCount: healthStatus.isOnline ? 0 : (prev.retryCount || 0)
        };

        return newStatus;
      });

      // If we have models but aren't connected, try to reconnect
      if (healthStatus.models?.length > 0 && !healthStatus.connected) {
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
  }, [healthStatus, testConnection, connectionStatus.retryCount]);

  // Update config function
  const updateConfig = useCallback((updates: Partial<LMStudioConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset config to defaults
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // This section was moved up before the useEffect

  // Auto-select first available model if current model is not available
  // or if no model is selected but models are available
  useEffect(() => {
    if (modelsData?.models?.length) {
      // Case 1: No model selected but models are available
      if (!config.model && modelsData.models.length > 0) {
        const firstModel = modelsData.models[0];
        updateConfig({ model: firstModel });
        toast({
          title: "Model Auto-Selected",
          description: `Selected ${firstModel} as it's available locally.`,
        });
      }
      // Case 2: Selected model is not in available models list
      else if (config.model && !modelsData.models.includes(config.model)) {
        const firstModel = modelsData.models[0];
        updateConfig({ model: firstModel });
        toast({
          title: "Model Changed",
          description: `Selected model is not available. Switched to ${firstModel}.`,
        });
      }
    }
  }, [modelsData, config.model, updateConfig, toast]);

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
        queryClient.invalidateQueries({ queryKey: ["/api/lmstudio/health"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/lmstudio/models"] })
      ]);

      // After refreshing, check if we need to retry connection
      const currentModels = modelsData?.models || [];
      setTimeout(() => {
        if (!connectionStatus.connected && currentModels.length > 0) {
          testConnection(currentModels[0]).catch(console.error);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to refresh LM Studio data:", error);
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh LM Studio status",
        variant: "destructive",
      });
    } finally {
      setConnectionStatus(prev => ({ ...prev, testing: false }));
    }
  }, [queryClient, connectionStatus.connected, modelsData, testConnection, toast]);

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

  // Available models already defined above

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
    const currentModels = modelsData?.models || [];
    if (currentModels.length > 0) {
      await testConnection(currentModels[0]);
    } else {
      // If no models, just refresh everything
      await refreshAll();
    }
  }, [refetchHealth, modelsData, testConnection, refreshAll]);

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
    availableModels,
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
      if (model.includes('qwen')) return 'Latest';
      if (model.includes('llama')) return 'Fast';
      return 'Local';
    }
  };
};

export default useLMStudioConfig;
