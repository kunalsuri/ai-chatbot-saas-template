/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { ExternalAIMessage, ExternalAIResponse, ProviderConfig } from '@shared/types/external-ai';

export abstract class ExternalAIProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract generateResponse(
    messages: ExternalAIMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<ExternalAIResponse>;

  abstract checkHealth(): Promise<boolean>;

  abstract getAvailableModels(): Promise<string[]>;

  getProviderName(): string {
    return this.config.provider;
  }
}
