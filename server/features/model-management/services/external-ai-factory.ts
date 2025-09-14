/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { ExternalProvider, ProviderConfig, GoogleAIConfig, AnthropicConfig, MistralConfig, OpenAIConfig, ExternalAIMessage, ExternalAIResponse } from '@shared/types/external-ai';
import { ExternalAIProvider } from './external-ai-base';
import { GoogleAIProvider } from './google-ai';

// Placeholder providers - will be implemented next
class AnthropicProvider extends ExternalAIProvider {
  constructor(config: AnthropicConfig) {
    super(config);
  }

  async generateResponse(
    messages: ExternalAIMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<ExternalAIResponse> {
    throw new Error('Anthropic provider not yet implemented');
  }

  async getAvailableModels() {
    return [];
  }

  async checkHealth(): Promise<boolean> {
    return false; // Provider not yet implemented
  }

  async validateApiKey() {
    return false;
  }
}

class MistralProvider extends ExternalAIProvider {
  constructor(config: MistralConfig) {
    super(config);
  }

  async generateResponse(
    messages: ExternalAIMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<ExternalAIResponse> {
    throw new Error('Mistral provider not yet implemented');
  }

  async getAvailableModels() {
    return [];
  }

  async checkHealth(): Promise<boolean> {
    return false; // Provider not yet implemented
  }

  async validateApiKey() {
    return false;
  }
}

class OpenAIProvider extends ExternalAIProvider {
  constructor(config: OpenAIConfig) {
    super(config);
  }

  async generateResponse(
    messages: ExternalAIMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<ExternalAIResponse> {
    throw new Error('OpenAI provider not yet implemented');
  }

  async getAvailableModels() {
    return [];
  }

  async checkHealth(): Promise<boolean> {
    return false; // Provider not yet implemented
  }

  async validateApiKey() {
    return false;
  }
}

export class ExternalAIFactory {
  static createProvider(config: ProviderConfig): ExternalAIProvider {
    switch (config.provider) {
      case 'google':
        return new GoogleAIProvider(config as GoogleAIConfig);
      case 'anthropic':
        return new AnthropicProvider(config as AnthropicConfig);
      case 'mistral':
        return new MistralProvider(config as MistralConfig);
      case 'openai':
        return new OpenAIProvider(config as OpenAIConfig);
      default:
        throw new Error(`Unsupported provider: ${(config as any).provider}`);
    }
  }

  static getSupportedProviders(): ExternalProvider[] {
    return ['google', 'anthropic', 'mistral', 'openai'];
  }

  static getDefaultModels(): Record<ExternalProvider, string> {
    return {
      google: 'gemini-1.5-flash',
      anthropic: 'claude-3-haiku-20240307',
      mistral: 'mistral-small-latest',
      openai: 'gpt-3.5-turbo'
    };
  }
}
