/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'local' | 'external';
  status: 'available' | 'downloading' | 'error' | 'offline';
  size?: string;
  contextLength?: number;
  description?: string;
  capabilities?: string[];
  metadata?: Record<string, any>;
}

export interface ModelProvider {
  id: string;
  name: string;
  type: 'local' | 'external';
  status: 'online' | 'offline' | 'error';
  host?: string;
  port?: number;
  apiKey?: string;
  models: AIModel[];
  healthCheck?: {
    lastChecked: string;
    responseTime: number;
    error?: string;
  };
}

export interface ModelTestRequest {
  providerId: string;
  modelId: string;
  prompt: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ModelTestResponse {
  response: string;
  metadata: {
    model: string;
    provider: string;
    tokens: number;
    processingTime: number;
    timestamp: string;
  };
}

export interface ModelDownloadProgress {
  modelId: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error';
  error?: string;
}

export interface ModelManagementState {
  providers: ModelProvider[];
  models: AIModel[];
  selectedProvider: string | null;
  selectedModel: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  downloadProgress: Record<string, ModelDownloadProgress>;
  error: string | null;
}

// External AI Provider Types
export type ExternalProvider = 'google' | 'anthropic' | 'mistral' | 'openai';

export interface ExternalAIConfig {
  provider: ExternalProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ExternalAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ExternalAIResponse {
  content: string;
  model: string;
  provider: ExternalProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ExternalAIModel {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  pricing?: {
    input: number;
    output: number;
  };
}

export interface ExternalAIHealthCheck {
  provider: ExternalProvider;
  connected: boolean;
  models: ExternalAIModel[];
  status: 'healthy' | 'error' | 'offline';
  message?: string;
  error?: string;
  latency?: number;
}

// Provider-specific configurations
export interface GoogleAIConfig extends ExternalAIConfig {
  provider: 'google';
  projectId?: string;
  location?: string;
}

export interface AnthropicConfig extends ExternalAIConfig {
  provider: 'anthropic';
  version?: string;
}

export interface MistralConfig extends ExternalAIConfig {
  provider: 'mistral';
}

export interface OpenAIConfig extends ExternalAIConfig {
  provider: 'openai';
  organization?: string;
}

export type ProviderConfig = GoogleAIConfig | AnthropicConfig | MistralConfig | OpenAIConfig;

export interface ExternalAIModelStatusProps {
  currentProvider: ExternalProvider;
  currentModel: string;
  healthStatus: Record<ExternalProvider, ExternalAIHealthCheck>;
  onProviderChange: (provider: ExternalProvider) => void;
  onModelChange: (model: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  compact?: boolean;
}
