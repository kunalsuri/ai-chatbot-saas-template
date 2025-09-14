/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { GoogleAIConfig, ExternalAIMessage, ExternalAIResponse, ProviderConfig } from '@shared/types/external-ai';
import { ExternalAIProvider } from './external-ai-base';
import { log } from '../../../shared/utils/logger';

interface GoogleAIModel {
  name: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
}

interface GoogleAIListModelsResponse {
  models: GoogleAIModel[];
}

interface GoogleAIGenerateRequest {
  contents: {
    parts: {
      text: string;
    }[];
    role: string;
  }[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GoogleAIGenerateResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GoogleAIProvider extends ExternalAIProvider {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(config: GoogleAIConfig) {
    super(config);
  }

  private get googleConfig(): GoogleAIConfig {
    return this.config as GoogleAIConfig;
  }

  async generateResponse(
    messages: ExternalAIMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<ExternalAIResponse> {
    try {
      const model = options?.model || this.config.model || 'gemini-1.5-flash';
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.googleConfig.apiKey}`;

      // Convert messages to Google AI format
      const contents = messages.map(msg => ({
        parts: [{ text: msg.content }],
        role: msg.role === 'assistant' ? 'model' : 'user'
      }));

      const requestBody: GoogleAIGenerateRequest = {
        contents,
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 2048
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        log.error('Google AI API error', { status: response.status, error: errorText });
        throw new Error(`Google AI API error (${response.status}): ${errorText}`);
      }

      const data: GoogleAIGenerateResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response candidates from Google AI');
      }

      const candidate = data.candidates[0];
      if (!candidate) {
        throw new Error('No valid candidate in Google AI response');
      }
      const content = candidate.content.parts.map(part => part.text).join('');

      return {
        content,
        usage: {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount
        },
        model,
        provider: 'google'
      };
    } catch (error) {
      log.error('Google AI generation failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(`Google AI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/models?key=${this.config.apiKey}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        log.info('Google AI health check successful');
        return true;
      } else {
        const errorText = await response.text();
        log.error('Google AI health check failed', { status: response.status, error: errorText });
        return false;
      }
    } catch (error) {
      log.error('Google AI health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/models?key=${this.config.apiKey}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        log.error('Failed to fetch Google AI models', { status: response.status });
        return this.getDefaultModels();
      }

      const data: GoogleAIListModelsResponse = await response.json();

      // Filter for generation-capable models
      const generationModels = data.models
        .filter(model =>
          model.supportedGenerationMethods.includes('generateContent') &&
          model.name.startsWith('models/')
        )
        .map(model => model.name.replace('models/', ''));

      return generationModels.length > 0 ? generationModels : this.getDefaultModels();
    } catch (error) {
      log.error('Failed to get Google AI models', { error: error instanceof Error ? error.message : 'Unknown error' });
      return this.getDefaultModels();
    }
  }

  private getDefaultModels(): string[] {
    return [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-pro-vision'
    ];
  }
}
