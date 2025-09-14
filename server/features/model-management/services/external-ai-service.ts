/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { ExternalProvider, ExternalAIMessage, ExternalAIResponse, ExternalAIHealthCheck, ExternalAIModel, ProviderConfig } from '../../../shared/types/external-ai';
import { ExternalAIFactory } from './external-ai-factory';
import { log } from '../../../shared/utils/logger';

interface ExternalAISettings {
  google?: {
    apiKey: string;
    model: string;
  };
  anthropic?: {
    apiKey: string;
    model: string;
  };
  mistral?: {
    apiKey: string;
    model: string;
  };
  openai?: {
    apiKey: string;
    model: string;
  };
}

export class ExternalAIService {
  private settings: ExternalAISettings = {};

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    // Load from environment variables
    this.settings = {
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '',
        model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash',
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      },
      mistral: {
        apiKey: process.env.MISTRAL_API_KEY || '',
        model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      },
    };
  }

  getSupportedProviders(): ExternalProvider[] {
    return ['google', 'anthropic', 'mistral', 'openai'];
  }

  isProviderConfigured(provider: ExternalProvider): boolean {
    const config = this.settings[provider];
    if (!config || !config.apiKey) {
      return false;
    }
    
    // Check for placeholder values that indicate the key is not actually configured
    const placeholderValues = [
      'your_openai_api_key_here',
      'your_google_ai_api_key_here',
      'your_anthropic_api_key_here',
      'your_mistral_api_key_here',
      'your-api-key-here',
      'placeholder',
      'your_key_here',
      'your-key-here',
    ];
    
    const isPlaceholder = placeholderValues.some(placeholder => 
      config.apiKey.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    if (isPlaceholder) {
      return false;
    }
    
    // Basic format validation for known providers
    switch (provider) {
      case 'openai':
        return config.apiKey.startsWith('sk-') && config.apiKey.length > 20;
      case 'google':
        return config.apiKey.startsWith('AIza') && config.apiKey.length > 20;
      case 'anthropic':
        return config.apiKey.startsWith('sk-ant-') && config.apiKey.length > 20;
      case 'mistral':
        return config.apiKey.length > 10; // Mistral keys don't have a specific prefix
      default:
        return config.apiKey.length > 10;
    }
  }

  getProviderConfig(provider: ExternalProvider): ProviderConfig | null {
    if (!this.isProviderConfigured(provider)) {
      return null;
    }

    const config = this.settings[provider]!;
    return {
      provider,
      apiKey: config.apiKey,
      model: config.model,
    };
  }

  async generateResponse(
    provider: ExternalProvider,
    messages: ExternalAIMessage[],
    options?: { model?: string; temperature?: number; maxTokens?: number }
  ): Promise<ExternalAIResponse> {
    if (!this.isProviderConfigured(provider)) {
      throw new Error(`Provider ${provider} is not configured`);
    }

    const config = this.settings[provider]!;
    const providerConfig: ProviderConfig = {
      provider,
      apiKey: config.apiKey,
      model: options?.model || config.model,
    } as ProviderConfig;
    const aiProvider = ExternalAIFactory.createProvider(providerConfig);

    try {
      const response = await aiProvider.generateResponse(messages, options);
      log.info(`External AI response generated successfully`, { provider, messageCount: messages.length });
      return response;
    } catch (error) {
      log.error(`External AI generation failed`, { provider, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async healthCheck(provider: ExternalProvider): Promise<ExternalAIHealthCheck> {
    if (!this.isProviderConfigured(provider)) {
      return {
        provider,
        connected: false,
        models: [],
        status: 'error',
        message: `Provider ${provider} is not configured`,
      };
    }

    const config = this.settings[provider]!;
    const providerConfig: ProviderConfig = {
      provider,
      apiKey: config.apiKey,
      model: config.model,
    } as ProviderConfig;
    const aiProvider = ExternalAIFactory.createProvider(providerConfig);

    try {
      const isHealthy = await aiProvider.checkHealth();
      return {
        provider,
        connected: isHealthy,
        models: isHealthy ? await this.getAvailableModels(provider) : [],
        status: isHealthy ? 'healthy' : 'error',
        message: isHealthy ? 'Provider is healthy' : 'Provider health check failed',
      };
    } catch (error) {
      return {
        provider,
        connected: false,
        models: [],
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getAllHealthChecks(): Promise<ExternalAIHealthCheck[]> {
    const providers = this.getSupportedProviders();
    const healthChecks = await Promise.all(
      providers.map(provider => this.healthCheck(provider))
    );
    return healthChecks;
  }

  async checkAllProvidersHealth(): Promise<Record<ExternalProvider, ExternalAIHealthCheck>> {
    const providers = this.getSupportedProviders();
    const healthChecks = await Promise.all(
      providers.map(async provider => ({
        provider,
        health: await this.healthCheck(provider)
      }))
    );
    
    return healthChecks.reduce((acc, { provider, health }) => {
      acc[provider] = health;
      return acc;
    }, {} as Record<ExternalProvider, ExternalAIHealthCheck>);
  }

  updateProviderConfig(provider: ExternalProvider, config: { apiKey: string; model: string }) {
    this.settings[provider] = config;
    log.info(`Provider configuration updated`, { provider });
  }

  async getAvailableModels(provider: ExternalProvider): Promise<ExternalAIModel[]> {
    if (!this.isProviderConfigured(provider)) {
      return this.getDefaultModels(provider).map(id => ({ id, name: id }));
    }

    try {
      const config = this.settings[provider]!;
      const aiProvider = ExternalAIFactory.createProvider({
        provider,
        apiKey: config.apiKey,
        model: config.model,
      } as ProviderConfig);

      const modelIds = await aiProvider.getAvailableModels();
      const models = modelIds.map(id => ({ id, name: id }));
      return models.length > 0 ? models : this.getDefaultModels(provider).map(id => ({ id, name: id }));
    } catch (error) {
      log.error(`Failed to fetch models for provider ${provider}`, { error: error instanceof Error ? error.message : 'Unknown error' });
      return this.getDefaultModels(provider).map(id => ({ id, name: id }));
    }
  }

  private getDefaultModels(provider: ExternalProvider): string[] {
    const defaultModels: Record<ExternalProvider, string[]> = {
      google: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'],
      anthropic: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
      mistral: ['mistral-small-latest', 'mistral-medium-latest', 'mistral-large-latest'],
      openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'],
    };

    return defaultModels[provider] || [];
  }

  getDefaultModel(provider: ExternalProvider): string {
    const config = this.settings[provider];
    return config?.model || this.getDefaultModels(provider)[0] || '';
  }

  async checkProviderHealth(provider: ExternalProvider): Promise<ExternalAIHealthCheck> {
    return await this.healthCheck(provider);
  }
}

// Export singleton instance
export const externalAIService = new ExternalAIService();
