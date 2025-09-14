/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

export interface LocalAIModelStatusProps {
  // Current state
  currentProvider: 'ollama' | 'lmstudio';
  currentModel: string;
  sessionInfo?: string; // e.g., "No active chat", "5 messages", etc.
  
  // Ollama status
  ollamaConnected: boolean;
  ollamaModels: string[];
  ollamaConnectionStatus: string;
  
  // LM Studio status
  lmStudioConnected: boolean;
  lmStudioModels: string[];
  lmStudioError?: string | undefined;
  
  // Actions
  onProviderChange: (provider: 'ollama' | 'lmstudio') => void;
  onModelChange?: (model: string) => void;
  onRefresh: () => void;
  
  // UI options
  showProviderToggle?: boolean;
  showModelSelect?: boolean;
  showRefreshButton?: boolean;
  showErrorAlert?: boolean;
  isRefreshing?: boolean;
  compact?: boolean;
}

export function LocalAIModelStatus({
  currentProvider,
  currentModel,
  sessionInfo,
  ollamaConnected,
  ollamaModels,
  ollamaConnectionStatus,
  lmStudioConnected,
  lmStudioModels,
  lmStudioError,
  onProviderChange,
  onModelChange,
  onRefresh,
  showProviderToggle = true,
  showModelSelect = true,
  showRefreshButton = true,
  showErrorAlert = true,
  isRefreshing = false,
  compact = false,
}: LocalAIModelStatusProps) {
  const getCurrentServerHealth = () => {
    if (currentProvider === 'ollama') {
      return {
        isOnline: ollamaConnected,
        models: ollamaModels,
        error: ollamaConnected ? undefined : ollamaConnectionStatus,
      };
    } else {
      return {
        isOnline: lmStudioConnected,
        models: lmStudioModels,
        error: lmStudioError,
      };
    }
  };

  const getAvailableModels = () => {
    return getCurrentServerHealth().models;
  };

  const serverHealth = getCurrentServerHealth();

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {sessionInfo && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {sessionInfo}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          {currentModel || 'No model'}
        </Badge>
        <div className="flex items-center gap-1">
          {serverHealth.isOnline ? (
            <Wifi className="w-3 h-3 text-green-500" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-500" />
          )}
          <span className="text-xs text-muted-foreground">
            {serverHealth.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        {showProviderToggle && (
          <Badge variant="outline" className="text-xs">
            {currentProvider === 'ollama' ? 'Ollama' : 'LM Studio'}
          </Badge>
        )}
        {showRefreshButton && (
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            disabled={isRefreshing}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {sessionInfo && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {sessionInfo}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {currentModel || 'No model'}
          </Badge>
        </div>

        {/* Server Status & Controls */}
        <div className="flex items-center gap-4">
          {/* Server Health Indicator */}
          <div className="flex items-center gap-2">
            {serverHealth.isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {serverHealth.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Model Selection */}
          {showModelSelect && getAvailableModels().length > 0 && onModelChange && (
            <Select value={currentModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableModels().map((model) => (
                  <SelectItem key={model} value={model} className="text-xs">
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* AI Provider Toggle */}
          {showProviderToggle && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="provider-toggle" className="text-sm font-medium">
                Ollama
              </Label>
              <Switch
                id="provider-toggle"
                checked={currentProvider === 'lmstudio'}
                onCheckedChange={(checked) => onProviderChange(checked ? 'lmstudio' : 'ollama')}
              />
              <Label htmlFor="provider-toggle" className="text-sm font-medium">
                LM Studio
              </Label>
            </div>
          )}

          {showRefreshButton && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="text-xs"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                  Checking...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {showErrorAlert && !serverHealth.isOnline && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {serverHealth.error || `${currentProvider} server is offline`}. 
            Please check your server status in the Local LLMs page.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default LocalAIModelStatus;
