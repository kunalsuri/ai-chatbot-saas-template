/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// External AI Provider Types
export type ExternalProvider = 'google' | 'anthropic' | 'mistral' | 'openai';

export interface ExternalAIConfig {
  provider: ExternalProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface ExternalAIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: ExternalProvider;
}

export interface ExternalAIError {
  message: string;
  code?: string;
  provider: ExternalProvider;
}

export interface ExternalAIState {
  google: {
    connected: boolean;
    models: string[];
    error?: string;
  };
  anthropic: {
    connected: boolean;
    models: string[];
    error?: string;
  };
  mistral: {
    connected: boolean;
    models: string[];
    error?: string;
  };
  openai: {
    connected: boolean;
    models: string[];
    error?: string;
  };
}

export interface ExternalAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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

export interface ProviderConfig {
  provider: ExternalProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface GoogleAIConfig extends ProviderConfig {
  provider: 'google';
}

export interface AnthropicConfig extends ProviderConfig {
  provider: 'anthropic';
}

export interface MistralConfig extends ProviderConfig {
  provider: 'mistral';
}

export interface OpenAIConfig extends ProviderConfig {
  provider: 'openai';
}

export interface LMStudioModelsResponse {
  data: Array<{
    id: string;
    object: string;
    created: number;
    owned_by: string;
  }>;
}

export interface LMStudioChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ExternalAIModelStatusProps {
  currentProvider: ExternalProvider;
  currentModel: string;
  sessionInfo: string;
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
  onProviderChange: (provider: ExternalProvider) => void;
  onModelChange: (model: string) => void;
  onRefresh: () => void;
  compact?: boolean;
}
