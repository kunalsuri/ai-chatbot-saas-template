/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Slider } from '@/shared/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Switch } from '@/shared/components/ui/switch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from "@/shared/hooks/use-toast";
import { RefreshCw, CheckCircle, XCircle, Settings, Zap, AlertTriangle } from 'lucide-react';
import { LMStudioConfig, LMStudioConnectionStatus } from "@/features/settings/hooks/useLMStudioConfig";

interface LMStudioConfigPanelProps {
  config: LMStudioConfig;
  onConfigChange: (config: LMStudioConfig) => void;
  showAdvanced?: boolean;
  compact?: boolean;
  className?: string;
}

const DEFAULT_CONFIG: LMStudioConfig = {
  model: "",
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 200,
  timeout: 15000,
  baseUrl: "http://localhost:1234",
  healthCheckEnabled: false,
};

export function LMStudioConfigPanel({
  config,
  onConfigChange,
  showAdvanced = true,
  compact = false,
  className = ""
}: LMStudioConfigPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<LMStudioConnectionStatus>({ 
    connected: false, 
    isOnline: false,
    testing: false 
  });

  // Queries
  const { data: modelsData, isLoading: modelsLoading, error: modelsError } = useQuery({
    queryKey: ["/api/lmstudio/models"],
    queryFn: () => api.getLMStudioModels(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const { data: healthStatus } = useQuery({
    queryKey: ["/api/lmstudio/health"],
    queryFn: () => api.checkLMStudioHealth(),
    refetchInterval: 30000, // Check every 30 seconds
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Update connection status based on health check
  useEffect(() => {
    if (healthStatus) {
      setConnectionStatus(prev => {
        const newStatus: LMStudioConnectionStatus = {
          ...prev,
          connected: healthStatus.connected,
          isOnline: healthStatus.isOnline,
          lastChecked: new Date()
        };
        if (!healthStatus.isOnline) {
          newStatus.error = 'Server not responding';
        }
        return newStatus;
      });
    }
  }, [healthStatus]);

  const testConnection = async () => {
    if (!config.model) {
      toast({
        title: "No Model Selected",
        description: "Please select a model before testing connection.",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus(prev => ({ ...prev, testing: true }));
    const startTime = Date.now();

    try {
      const result = await api.testLMStudioConnection(config.model);
      const latency = Date.now() - startTime;
      
      const newStatus: LMStudioConnectionStatus = {
        connected: result.connected,
        isOnline: result.connected,
        latency: result.latency || 0,
        testing: false,
        lastChecked: new Date(),
      };
      if (!result.connected && result.error) {
        newStatus.error = result.error;
      }
      setConnectionStatus(newStatus);

      if (result.connected) {
        toast({
          title: "LM Studio Connection Successful",
          description: `Connected to LM Studio with ${config.model} (${latency}ms)`,
        });
      } else {
        // Format error message to be more actionable
        let errorDescription = result.error || "Unable to connect to LM Studio server";
        
        // Add helpful guidance for common errors
        if (errorDescription.includes("404")) {
          errorDescription = `${errorDescription}. Make sure LM Studio is running and the local server is started.`;
        } else if (errorDescription.includes("not available")) {
          errorDescription = `${errorDescription}. Please select a different model or load this model in LM Studio.`;
        }
        
        toast({
          title: "LM Studio Connection Failed",
          description: errorDescription,
          variant: "destructive",
        });
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      
      setConnectionStatus({
        connected: false,
        isOnline: false,
        error: errorMessage,
        latency,
        testing: false,
        lastChecked: new Date()
      });

      // Only show toast if this is a network/fetch error, not a server-returned error
      // Server errors are already handled in the success branch with result.error
      if (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError')) {
        // Format error message to be more actionable
        let actionableMessage = errorMessage;
        
        if (error instanceof TypeError) {
          actionableMessage = "Network error: Unable to reach LM Studio server. Make sure LM Studio is running with the API server enabled.";
        } else if (error instanceof Error && error.name === 'AbortError') {
          actionableMessage = "Connection timed out. Make sure LM Studio is running and responsive.";
        }
        
        toast({
          title: "LM Studio Connection Error",
          description: actionableMessage,
          variant: "destructive",
        });
      }
    }
  };

  const refreshModels = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/lmstudio/models"] });
    queryClient.invalidateQueries({ queryKey: ["/api/lmstudio/health"] });
  };

  const resetToDefaults = () => {
    onConfigChange(DEFAULT_CONFIG);
    toast({
      title: "Settings Reset",
      description: "LM Studio configuration reset to default values.",
    });
  };

  const updateConfig = (updates: Partial<LMStudioConfig>) => {
    // Log health check toggle changes
    if ('healthCheckEnabled' in updates) {
      console.log(`[LM Studio] Health check ${updates.healthCheckEnabled ? 'ENABLED' : 'DISABLED'} by user`);
    }
    
    onConfigChange({ ...config, ...updates });
  };

  const getConnectionStatusColor = () => {
    if (connectionStatus.testing) return "text-yellow-600";
    return connectionStatus.connected ? "text-green-600" : "text-red-600";
  };

  const getConnectionStatusIcon = () => {
    if (connectionStatus.testing) return <RefreshCw className="w-4 h-4 animate-spin" />;
    return connectionStatus.connected ? 
      <CheckCircle className="w-4 h-4" /> : 
      <XCircle className="w-4 h-4" />;
  };

  const availableModels = modelsData?.models || [];

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">LM Studio Model</Label>
          <div className={`flex items-center gap-1 text-xs ${getConnectionStatusColor()}`}>
            {getConnectionStatusIcon()}
            {connectionStatus.connected ? 'Connected' : 'Offline'}
          </div>
        </div>
        
        <Select value={config.model} onValueChange={(value) => updateConfig({ model: value })}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels?.length ? (
              availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-models-compact" disabled>
                {connectionStatus.connected ? "Loading..." : "No models"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5" />
            LM Studio Configuration
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="health-check-toggle" className="text-sm font-medium cursor-pointer">
                Health Check
              </Label>
              <Switch 
                id="health-check-toggle" 
                checked={config.healthCheckEnabled} 
                onCheckedChange={(checked) => updateConfig({ healthCheckEnabled: checked })}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {config.healthCheckEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            {config.healthCheckEnabled && (
              <div className={`flex items-center gap-1 text-sm ${getConnectionStatusColor()}`}>
                {getConnectionStatusIcon()}
                <span>{connectionStatus.connected ? 'Connected' : 'Offline'}</span>
                {connectionStatus.latency && (
                  <span className="text-xs text-muted-foreground">({connectionStatus.latency}ms)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status Alert - Only show when health check is enabled */}
        {config.healthCheckEnabled && !connectionStatus.connected && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {connectionStatus.error || 'LM Studio server is offline'}. 
              Make sure LM Studio is running and the local server is started.
            </AlertDescription>
          </Alert>
        )}

        {/* Model Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Model</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshModels}
                disabled={modelsLoading}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${modelsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <Select value={config.model} onValueChange={(value) => updateConfig({ model: value })}>
              <SelectTrigger>
                <SelectValue placeholder={availableModels?.length ? "Select a model" : "Loading models..."} />
              </SelectTrigger>
              <SelectContent>
                {availableModels?.length ? (
                  availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {model.toLowerCase().includes('qwen') ? 'Latest' : 
                           model.toLowerCase().includes('llama') ? 'Fast' : 'Local'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-models" disabled>
                    {config.healthCheckEnabled ? 
                      (connectionStatus.connected ? "Loading models..." : "Connect to LM Studio to see models") :
                      "Enable health check to see models"
                    }
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {availableModels?.length ? (
              <p className="text-xs text-muted-foreground mt-1">
                <CheckCircle className="w-3 h-3 inline mr-1 text-green-500" />
                {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available
              </p>
            ) : config.healthCheckEnabled && connectionStatus.connected ? (
              <p className="text-xs text-amber-600 mt-1">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                No models found. Load a model in LM Studio first.
              </p>
            ) : config.healthCheckEnabled ? (
              <p className="text-xs text-red-600 mt-1">
                <XCircle className="w-3 h-3 inline mr-1" />
                Connect to LM Studio to see available models
              </p>
            ) : null}
          </div>
          
          <div>
            <Label>Base URL</Label>
            <Input
              value={config.baseUrl}
              onChange={(e) => updateConfig({ baseUrl: e.target.value })}
              placeholder="http://localhost:1234"
            />
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4">
            <div>
              <Label>Temperature: {config.temperature}</Label>
              <Slider
                value={[config.temperature]}
                onValueChange={(value: number[]) => {
                  const temp = value[0];
                  if (temp !== undefined) {
                    updateConfig({ temperature: temp });
                  }
                }}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Controls randomness. Lower = more focused, Higher = more creative
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Top P: {config.topP}</Label>
                <Slider
                  value={[config.topP]}
                  onValueChange={(value: number[]) => {
                  const topP = value[0];
                  if (topP !== undefined) {
                    updateConfig({ topP });
                  }
                }}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Max Tokens: {config.maxTokens}</Label>
                <Slider
                  value={[config.maxTokens]}
                  onValueChange={(value: number[]) => {
                  const maxTokens = value[0];
                  if (maxTokens !== undefined) {
                    updateConfig({ maxTokens });
                  }
                }}
                  max={1000}
                  min={50}
                  step={50}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Timeout (ms): {config.timeout}</Label>
              <Slider
                value={[config.timeout]}
                onValueChange={(value: number[]) => {
                  const timeout = value[0];
                  if (timeout !== undefined) {
                    updateConfig({ timeout });
                  }
                }}
                max={30000}
                min={5000}
                step={1000}
                className="mt-2"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={testConnection}
            disabled={connectionStatus.testing || !config.model}
            variant="outline"
            className="flex-1"
          >
            {connectionStatus.testing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
          
          <Button
            onClick={resetToDefaults}
            variant="ghost"
            size="sm"
          >
            Reset Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LMStudioConfigPanel;
