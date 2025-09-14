/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
    dataCollection: boolean;
  };
  performance: {
    animationsEnabled: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
}

export interface OllamaConfig {
  enabled: boolean;
  host: string;
  port: number;
  models: string[];
  healthCheckEnabled: boolean;
  timeout: number;
}

export interface LMStudioConfig {
  enabled: boolean;
  host: string;
  port: number;
  models: string[];
  healthCheckEnabled: boolean;
  timeout: number;
}

export interface ExternalAIConfig {
  providers: {
    google: {
      enabled: boolean;
      apiKey: string;
      models: string[];
    };
    anthropic: {
      enabled: boolean;
      apiKey: string;
      models: string[];
    };
    openai: {
      enabled: boolean;
      apiKey: string;
      models: string[];
    };
    mistral: {
      enabled: boolean;
      apiKey: string;
      models: string[];
    };
  };
}

export interface SettingsState {
  appSettings: AppSettings;
  ollamaConfig: OllamaConfig;
  lmStudioConfig: LMStudioConfig;
  externalAIConfig: ExternalAIConfig;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
