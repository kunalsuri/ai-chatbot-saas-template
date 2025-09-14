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
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Key, Globe } from 'lucide-react';
import { ExternalProvider } from '@/features/model-management/types';

export interface ExternalAIModelStatusProps {
  // Current state
  currentProvider: ExternalProvider;
  currentModel: string;
  sessionInfo?: string; // e.g., "No active chat", "5 messages", etc.
  
  // Provider status
  googleConnected: boolean;
  googleModels: string[];
  googleError?: string;
  
  anthropicConnected: boolean;
  anthropicModels: string[];
  anthropicError?: string;
  
  mistralConnected: boolean;
  mistralModels: string[];
  mistralError?: string;
  
  openaiConnected: boolean;
  openaiModels: string[];
  openaiError?: string;
  
  // Actions
  onProviderChange: (provider: ExternalProvider) => void;
  onModelChange?: (model: string) => void;
  onRefresh: () => void;
  
  // UI options
  showProviderSelect?: boolean;
  showModelSelect?: boolean;
  showRefreshButton?: boolean;
  showErrorAlert?: boolean;
  showApiKeyStatus?: boolean;
  isRefreshing?: boolean;
  compact?: boolean;
}

export function ExternalAIModelStatus({
  currentProvider,
  currentModel,
  sessionInfo,
  googleConnected,
  googleModels,
  googleError,
  anthropicConnected,
  anthropicModels,
  anthropicError,
  mistralConnected,
  mistralModels,
  mistralError,
  openaiConnected,
  openaiModels,
  openaiError,
  onProviderChange,
  onModelChange,
  onRefresh,
  showProviderSelect = true,
  showModelSelect = true,
  showRefreshButton = true,
  showErrorAlert = true,
  showApiKeyStatus = true,
  isRefreshing = false,
  compact = false,
}: ExternalAIModelStatusProps) {
  const getCurrentProviderHealth = () => {
    switch (currentProvider) {
      case 'google':
        return {
          isOnline: googleConnected,
          models: googleModels,
          error: googleError,
        };
      case 'anthropic':
        return {
          isOnline: anthropicConnected,
          models: anthropicModels,
          error: anthropicError,
        };
      case 'mistral':
        return {
          isOnline: mistralConnected,
          models: mistralModels,
          error: mistralError,
        };
      case 'openai':
        return {
          isOnline: openaiConnected,
          models: openaiModels,
          error: openaiError,
        };
      default:
        return {
          isOnline: false,
          models: [],
          error: 'Unknown provider',
        };
    }
  };

  const getAvailableModels = () => {
    return getCurrentProviderHealth().models;
  };

  const getProviderDisplayName = (provider: ExternalProvider) => {
    switch (provider) {
      case 'google':
        return 'Google AI';
      case 'anthropic':
        return 'Anthropic';
      case 'mistral':
        return 'Mistral AI';
      case 'openai':
        return 'OpenAI';
      default:
        return provider;
    }
  };

  const providerHealth = getCurrentProviderHealth();

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
          {providerHealth.isOnline ? (
            <Globe className="w-3 h-3 text-green-500" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-500" />
          )}
          <span className="text-xs text-muted-foreground">
            {providerHealth.isOnline ? 'Connected' : 'Offline'}
          </span>
        </div>
        {showProviderSelect && (
          <Badge variant="outline" className="text-xs">
            {getProviderDisplayName(currentProvider)}
          </Badge>
        )}
        {showApiKeyStatus && (
          <div className="flex items-center gap-1">
            <Key className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {providerHealth.isOnline ? 'Valid' : 'Invalid'}
            </span>
          </div>
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

        {/* Provider Status & Controls */}
        <div className="flex items-center gap-4">
          {/* API Connection Indicator */}
          <div className="flex items-center gap-2">
            {providerHealth.isOnline ? (
              <Globe className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {providerHealth.isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* API Key Status */}
          {showApiKeyStatus && (
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {providerHealth.isOnline ? 'Valid API Key' : 'Invalid API Key'}
              </span>
            </div>
          )}

          {/* Model Selection */}
          {showModelSelect && getAvailableModels().length > 0 && onModelChange && (
            <Select value={currentModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-48 h-8 text-xs">
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

          {/* Provider Selection */}
          {showProviderSelect && (
            <Select value={currentProvider} onValueChange={onProviderChange}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google" className="text-xs">Google AI</SelectItem>
                <SelectItem value="anthropic" className="text-xs">Anthropic</SelectItem>
                <SelectItem value="mistral" className="text-xs">Mistral AI</SelectItem>
                <SelectItem value="openai" className="text-xs">OpenAI</SelectItem>
              </SelectContent>
            </Select>
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
      {showErrorAlert && !providerHealth.isOnline && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {providerHealth.error || `${getProviderDisplayName(currentProvider)} API is not available`}. 
            Please check your API key configuration in Settings.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ExternalAIModelStatus;
