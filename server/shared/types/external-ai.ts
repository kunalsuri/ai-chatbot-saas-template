/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

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
  error?: string;
  latency?: number;
  status: 'healthy' | 'error';
  message?: string;
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
